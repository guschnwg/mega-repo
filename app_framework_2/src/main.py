import logging
from datetime import datetime, timezone
from typing import cast

import httpx
import jwt
from fastmcp import FastMCP
from fastmcp.server.auth import AccessToken, OAuthProxy, TokenVerifier
from fastmcp.server.dependencies import get_access_token as _get_access_token, get_http_request
from starlette.requests import Request
from starlette.responses import HTMLResponse, JSONResponse, RedirectResponse

from db import Db
from crypto import hash_password, verify_password
import utils

URL = "https://sterling-redfish-game.ngrok-free.app"
CLIENT_ID = "123"
CLIENT_SECRET = "456"
SCOPES = ["all", "email", "openid", "profile"]
JWT_SECRET_KEY = "JWT_SECRET_KEY"
JWT_EXPIRATION = 60 * 5

# Change to DB
CODE_TO_USER = {}

logger = logging.getLogger("fastmcp")
logger.setLevel(logging.DEBUG)

db = Db()
db.migrate()
db.seed()

from fastmcp.server.dependencies import get_http_request

def get_access_token():
    access_token = _get_access_token()
    if not access_token:
        return None

    request = get_http_request()
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        fresh_token = auth_header[7:]
        access_token.token = fresh_token

    return access_token

class AdRollTokenVerifier(TokenVerifier):
    async def verify_token(self, token: str) -> AccessToken | None:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{URL}/me", headers={"Authorization": f"Bearer {token}"})
            if response.is_error:
                return None

            results = response.json()

            return AccessToken(
                token=token,
                client_id=CLIENT_ID,
                scopes=results.get("scopes"),
                claims=results.get("claims"),
            )

mcp = FastMCP(
    "My MCP Server",
    auth=OAuthProxy(
        upstream_authorization_endpoint=f"{URL}/auth/authorize",
        upstream_token_endpoint=f"{URL}/auth/token",
        upstream_client_id=CLIENT_ID,
        upstream_client_secret=CLIENT_SECRET,
        token_verifier=AdRollTokenVerifier(required_scopes=SCOPES),
        base_url=URL,
        forward_pkce=False,
        valid_scopes=SCOPES,
        token_endpoint_auth_method="client_secret_post",
    )
)

@mcp.tool
def greet(name: str) -> str:
    return f"Hello, {name}!"

@mcp.custom_route("/", methods=["GET"])
async def homepage(request: Request):
    return HTMLResponse("<html><body><h1>HI</h1></body></html>")

@mcp.custom_route("/me", methods=["GET"])
async def me(request: Request):
    auth = request.headers.get("authorization") or ""
    access_token = auth.replace("Bearer ", "")
    decoded = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=["HS256"])

    session = db.get_oauth_session_by_token(access_token)
    if not session:
        return JSONResponse({"error": True}, 401)

    if session.valid_until < datetime.now(timezone.utc):
        return JSONResponse({"error": True}, 401)

    user = db.get_user_by_id(session.user_id)
    if not user:
        return JSONResponse({"error": True}, 401)

    return JSONResponse({
        "scopes": SCOPES,
        "claims": decoded,
    })

@mcp.custom_route("/auth/consent", methods=["GET", "POST"])
async def auth_consent(request: Request):
    redirect_uri = request.query_params.get("redirect_uri")
    state = request.query_params.get("state")

    if request.method == "GET":
        return HTMLResponse(
            f"""
            <html>
                <body>
                    <h1>Consent</h1>
                    <form action="/auth/consent?redirect_uri={redirect_uri}&state={state}" method="post">
                        <input type="text" name="email" id="email" value="admin@example.com" />
                        <input type="password" name="password" id="password" value="password1" />
                        <button type="submit">Confirm</button>
                    </form>
                </body>
            </html>
            """
        )

    form = await request.form()
    email = cast(str, form.get("email"))
    password = cast(str, form.get("password"))

    user = db.get_user_by_email_with_password(email)
    if not user or not verify_password(password, user.password):
        return RedirectResponse(f"{URL}/auth/consent?redirect_uri={redirect_uri}&state={state}", 303)

    code = f"NEW_CODE_FOR_STATE_{state}"
    db.create_oauth_code_to_user(user.id, code, state)
    return RedirectResponse(f"{redirect_uri}?code={code}&state={state}", 303)

@mcp.custom_route("/auth/authorize", methods=["GET"])
async def authorize(request: Request):
    response_type = request.query_params.get("response_type")
    client_id = request.query_params.get("client_id")
    code_challenge_method = request.query_params.get("code_challenge_method")
    scope = request.query_params.get("scope")

    redirect_uri = request.query_params.get("redirect_uri")
    state = request.query_params.get("state")

    return RedirectResponse(f"{URL}/auth/consent?redirect_uri={redirect_uri}&state={state}")

@mcp.custom_route("/auth/token", methods=["POST"])
async def token(request: Request):
    form = await request.form()

    user = None
    grant_type = form.get("grant_type")

    if grant_type == 'authorization_code':
        user = db.get_user_by_oauth_code(cast(str, form.get("code")))
    elif grant_type == 'refresh_token':
        user = db.get_user_by_refresh_token(cast(str, form.get("refresh_token")))
    else:
        return JSONResponse({"error": True}, 404)

    if not user:
        return JSONResponse({"error": True}, 401)

    payload = {
        "email": user.email,
        "issued_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")
    }
    refresh_payload = {**payload, "token_use": "refresh"}

    access_token = jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")
    refresh_token = jwt.encode(refresh_payload, JWT_SECRET_KEY, algorithm="HS256")

    if grant_type == 'authorization_code':
        oauth_token = db.create_oauth_token(user.id, access_token, refresh_token, JWT_EXPIRATION)
    elif grant_type == 'refresh_token':
        oauth_token = db.update_oauth_token_from_refresh_token(
            user.id,
            cast(str, form.get("refresh_token")),
            access_token,
            refresh_token,
            JWT_EXPIRATION
        )
    else:
        return JSONResponse({"error": True}, 404)

    return JSONResponse({
        "access_token": access_token,
        "token_type": "Bearer",
        "expires_in": JWT_EXPIRATION,
        "refresh_token": refresh_token
    })

app = mcp.http_app(path='/mcp')
