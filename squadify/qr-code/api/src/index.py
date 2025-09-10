from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import secrets

import bcrypt
import copy
from urllib.parse import parse_qsl

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode(), salt)
    return hashed.decode()

def verify_password(candidate: str, actual: str) -> bool:
    return bcrypt.checkpw(candidate.encode(), actual.encode())

#

users = [
    {"id": 1, "email": "john.doe@example.com", "password": hash_password("password1"), "roles": ["admin"], "deleted": False},
    {"id": 2, "email": "jane.doe@example.com", "password": hash_password("password2"), "roles": ["user"], "deleted": False},
    {"id": 3, "email": "bob.smith@example.com", "password": hash_password("password3"), "roles": ["user"], "deleted": False},
    {"id": 4, "email": "alice.johnson@example.com", "password": hash_password("password4"), "roles": ["user"], "deleted": True},
    {"id": 5, "email": "charlie.brown@example.com", "password": hash_password("password5"), "roles": ["user"], "deleted": False},
    {"id": 6, "email": "david.lee@example.com", "password": hash_password("password6"), "roles": ["user"], "deleted": False},
    {"id": 7, "email": "david.lee.2@example.com", "password": hash_password("password6"), "roles": ["user"], "deleted": False},
]

sessions = [
    {"user_id": 1, "token": "token1", "valid_until": datetime.now() + timedelta(days=365)}
]

#

def generate_session(user_id):
    token = secrets.token_urlsafe(16)
    session = {"token": token, "user_id": user_id, "valid_until": datetime.now() + timedelta(hours=1)}
    sessions.append(session)
    return session

#

def me(user, data):
    response = copy.deepcopy(user)
    del response["password"]
    return 200, response

def list_users(user, data):
    if "admin" not in user["roles"]:
        return 401, {"error": "Unauthorized"}

    response = copy.deepcopy(users)
    for user in response:
        del user["password"]

    return 200, response

get_endpoints = {
    "me": me,
    "list_users": list_users
}

#

def login(data):
    possible_user = next(
        (u for u in users if u["email"] == data["email"]),
        None
    )
    if not possible_user or possible_user["deleted"]:
       return None

    if not verify_password(data["password"], possible_user["password"]):
        return None

    return generate_session(possible_user["id"])

def create_user(user, data):
    if "admin" not in user["roles"]:
        return 401, {"error": "Unauthorized"}

    new_user = {
        "id": len(users) + 1,
        "email": data["email"],
        "password": hash_password(data["password"]),
        "roles": data.get("roles") or ["user"],
        "deleted": False,
    }
    users.append(new_user)

    response = copy.deepcopy(new_user)
    del response["password"]

    return 201, response

def update_user(user, data):
    if "admin" not in user["roles"]:
        return 401, {"error": "Unauthorized"}

    updated_user = {
        "id": user["id"],
        "email": data.get("email", user["email"]),
        "password": hash_password(data.get("password", user["password"])),
        "roles": data.get("roles", user["roles"]),
        "deleted": data.get("deleted", user["deleted"])
    }
    users[user["id"] - 1] = updated_user

    response = copy.deepcopy(updated_user)
    del response["password"]

    return 200, response

post_endpoints = {
    "create_user": create_user,
    "update_user": update_user,
}

#

def get_user_from_token(cookie):
    if not cookie or "session=" not in cookie:
        return None

    token = cookie.split("session=")[1].split(";")[0]
    if not token:
        return None

    session = next((sess for sess in sessions if sess["token"] == token), None)
    if not session:
        return None

    if session["valid_until"] < datetime.now():
        return None

    user = next((u for u in users if u["id"] == session["user_id"]), None)
    if not user:
       return None

    if user["deleted"]:
        return None

    return user

#

class Handler(BaseHTTPRequestHandler):
    def _get_data(self):
        content_length = int(self.headers.get('Content-Length', 0))
        return self.rfile.read(content_length).decode('utf-8')

    def _get_input_data(self):
        raw_input = self._get_data()
        if self.headers.get('Content-Type') == 'application/json':
            try:
                return json.loads(raw_input)
            except json.JSONDecodeError:
                return {}

        if self.headers.get('Content-Type') == 'application/x-www-form-urlencoded':
            try:
                return dict(parse_qsl(raw_input))
            except ValueError:
                return {}

        return {}

    def _set_response(
        self,
        code=200,
        content_type='text/html',
        data: str | bytes = "",
    ):
        self.send_response(code)
        self.send_header('Content-type', content_type)
        self.end_headers()
        self.wfile.write(data.encode('utf-8') if isinstance(data, str) else data)

    def do_GET(self):
        if self.path.startswith("/api"):
            user = get_user_from_token(self.headers.get('Cookie'))
            if not user:
                return self._set_response(
                    code=401,
                    content_type='application/json',
                    data=json.dumps({"error": "Invalid token"}),
                )

            endpoint = self.path.replace("/api/", "")
            if endpoint in get_endpoints:
                try:
                    response_code, response_data = get_endpoints[endpoint](user, {})
                    return self._set_response(
                        code=response_code,
                        content_type='application/json',
                        data=json.dumps(response_data),
                    )
                except:
                    return self._set_response(
                        code=500,
                        content_type='application/json',
                        data=json.dumps({"error": "Unexpected error"}),
                    )

            return self._set_response(
                content_type='application/json',
                data=json.dumps({"error": "Endpoint not found"}),
            )

        if self.path.startswith("/dist"):
            with open(f'/app{self.path}', 'rb') as file:
                return self._set_response(data=file.read())

        with open('/app/index.html', 'rb') as file:
            return self._set_response(data=file.read())

    def do_POST(self):
        if self.path == "/api/login":
            try:
                session = login(self._get_input_data())
            except:
                session = None

            if not session:
                self.send_response(302)
                self.send_header("Location", "/login")
                return self.end_headers()

            self.send_response(302)
            self.send_header('Set-Cookie', f"session={session['token']}; HttpOnly; Secure; SameSite=Strict; Path=/")
            self.send_header("Location", "/")
            return self.end_headers()

        if self.path.startswith("/api/"):
            user = get_user_from_token(self.headers.get('Cookie'))
            if not user:
                return self._set_response(
                    code=401,
                    content_type='application/json',
                    data=json.dumps({"error": "Invalid token"}),
                )

            endpoint = self.path.replace("/api/", "")
            if endpoint in post_endpoints:
                try:
                    response = post_endpoints[endpoint](user, self._get_input_data())
                    return self._set_response(
                        content_type='application/json',
                        data=json.dumps(response),
                    )
                except:
                    return self._set_response(
                        code=500,
                        content_type='application/json',
                        data=json.dumps({"error": "Unexpected error"}),
                    )

            return self._set_response(
                content_type='application/json',
                data=json.dumps({"echo": self._get_data()}),
            )

httpd = HTTPServer(('', 8000), Handler)

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    pass

httpd.server_close()
