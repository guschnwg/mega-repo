from datetime import datetime

import jwt
from fastmcp import FastMCP
from fastmcp.server.auth import AccessToken, OAuthProxy, TokenVerifier
from starlette.requests import Request
from starlette.responses import JSONResponse, RedirectResponse

from db import Db
from crypto import hash_password


db = Db()
db.migrate()
db.seed()

class AdRollTokenVerifier(TokenVerifier):
    async def verify_token(self, token: str) -> AccessToken | None:
        return AccessToken(
            token=token,
            client_id="123",
            scopes=["all"],
            claims={"sub": ":)", "email": "email@email.com"},
        )

mcp = FastMCP(
    "My MCP Server",
    auth=OAuthProxy(
        upstream_authorization_endpoint="https://sterling-redfish-game.ngrok-free.app/auth/authorize",
        upstream_token_endpoint="https://sterling-redfish-game.ngrok-free.app/auth/token",
        upstream_client_id="123",
        upstream_client_secret="456",
        token_verifier=AdRollTokenVerifier(required_scopes=["all"]),
        base_url="https://sterling-redfish-game.ngrok-free.app",
        forward_pkce=False,  # AdRoll does not support PKCE
        valid_scopes=["all", "email", "openid", "profile"],
        token_endpoint_auth_method="client_secret_post",  # AdRoll uses POST body auth
    )
)

@mcp.tool
def greet(name: str) -> str:
    return f"Hello, {name}!"

@mcp.custom_route("/", methods=["GET"])
async def homepage(request: Request):
    new_session = db.create_session(1, hash_password("token"), hash_password("refresh"), datetime.now())
    return JSONResponse({
        "users": [u.model_dump() for u in db.get_users()],
        "sessions": [u.model_dump() for u in db.get_sessions()],
        "create_session": new_session.model_dump(),
        "session": db.get_session_by_token(new_session.token).model_dump(),
    })

@mcp.custom_route("/me", methods=["GET"])
async def me(request: Request):
    return JSONResponse({})

@mcp.custom_route("/auth/authorize", methods=["GET"])
async def authorize(request: Request):
    response_type = request.query_params.get("response_type")
    client_id = request.query_params.get("client_id")
    code_challenge_method = request.query_params.get("code_challenge_method")
    redirect_uri = request.query_params.get("redirect_uri")
    scope = request.query_params.get("scope")
    state = request.query_params.get("state")

    return RedirectResponse(f"{redirect_uri}?code=auth_code_123&state={state}")

@mcp.custom_route("/auth/token", methods=["POST"])
async def token(request: Request):
    print(await request.body())

    payload_data = {
        "sub": "4242",
        "name": "Jessica Temporal",
        "nickname": "Jess"
    }
    my_secret = 'my_super_secret'
    token = jwt.encode(
        payload=payload_data,
        key=my_secret
    )

    return JSONResponse({
        "access_token": token,
        "token_type": "Bearer",
        "expires_in": 5,
        "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA"
    })

app = mcp.http_app(path='/mcp')

# app = Starlette(
#     debug=True,
#     routes=[
#         Route('/', homepage),
#         Route('/me', me),
#         Route('/authorize', authorize),
#         Route('/token', token),
#     ],
# )
