from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import secrets
import copy
from urllib.parse import parse_qsl

from utils import hash_password, verify_password
from db import db

#

people = [
    {"id": 1, "name": "John Doe", "qr_code": hash_password("John Doe")},
    {"id": 2, "name": "Jane Doe", "qr_code": hash_password("Jane Doe")},
    {"id": 3, "name": "Bob Smith", "qr_code": hash_password("Bob Smith")},
    {"id": 4, "name": "Alice Johnson", "qr_code": hash_password("Alice Johnson")},
    {"id": 5, "name": "Charlie Brown", "qr_code": hash_password("Charlie Brown")},
    {"id": 6, "name": "David Lee", "qr_code": hash_password("David Lee")},
]

places = [
    {"id": 1, "name": "Living Room"},
    {"id": 2, "name": "Bedroom"},
    {"id": 3, "name": "Kitchen"},
    {"id": 4, "name": "Bathroom"},
    {"id": 5, "name": "Office"},
    {"id": 6, "name": "Garage"},
]

beeps = [
    {"user_id": 1, "place_id": 1, "person_id": 1, "timestamp": "2023-01-01T12:00:00Z"},
    {"user_id": 1, "place_id": 1, "person_id": 2, "timestamp": "2023-01-01T12:00:00Z"},
    {"user_id": 2, "place_id": 2, "person_id": 2, "timestamp": "2023-01-01T12:00:00Z"},
    {"user_id": 3, "place_id": 3, "person_id": 3, "timestamp": "2023-01-01T12:00:00Z"},
    {"user_id": 3, "place_id": 3, "person_id": 4, "timestamp": "2023-01-01T12:00:00Z"},
    {"user_id": 3, "place_id": 3, "person_id": 5, "timestamp": "2023-01-01T12:00:00Z"},
    {"user_id": 3, "place_id": 3, "person_id": 6, "timestamp": "2023-01-01T12:00:00Z"},
    {"user_id": 4, "place_id": 4, "person_id": 4, "timestamp": "2023-01-01T12:00:00Z"},
    {"user_id": 5, "place_id": 5, "person_id": 5, "timestamp": "2023-01-01T12:00:00Z"},
    {"user_id": 6, "place_id": 6, "person_id": 6, "timestamp": "2023-01-01T12:00:00Z"},
]

#

def generate_session(user_id):
    return

#

def me(user, data):
    return 200, user

def list_users(user, data):
    if "admin" not in user["roles"]:
        return 403, {"error": "Unauthorized"}

    return 200, db.get_users()

def list_beeps(user, data):
    if "admin" not in user["roles"]:
        return 403, {"error": "Unauthorized"}

    return 200, beeps

def list_places(user, data):
    return 200, places

get_endpoints = {
    "me": me,
    "list_users": list_users,
    "list_places": list_places,
    "list_beeps": list_beeps,
}

#

def login(data):
    possible_user = db.get_user_by_email_with_password(data["email"])
    if not possible_user or not possible_user["active"]:
        return None

    if not verify_password(data["password"], possible_user["password"]):
        return None

    return db.create_session(possible_user["id"], secrets.token_urlsafe(16), datetime.now() + timedelta(hours=1))

def create_user(user, data):
    if "admin" not in user["roles"]:
        return 403, {"error": "Unauthorized"}

    existing_user = db.get_user_by_email(data["email"])
    if existing_user:
        return 409, {"error": "Email already exists"}

    return 201, db.create_user(data["email"], hash_password(data["password"]), data.get("roles") or ["user"], True)

def update_user(user, data):
    if "admin" not in user["roles"]:
        return 403, {"error": "Unauthorized"}

    user_to_update = db.get_user_with_password(data["id"])
    if not user_to_update:
        return 404, {"error": "User not found"}

    print(data)

    updated_user = db.update_user(
        data["id"],
        data["email"] if "email" in data else user_to_update["email"],
        hash_password(data["password"]) if "password" in data else user_to_update["password"],
        data["roles"] if "roles" in data else user_to_update["roles"],
        data["active"] if "active" in data else user_to_update["active"]
    )

    return 200, updated_user

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

    session = db.get_session_by_token(token)
    if not session:
        return None

    if session["valid_until"] < datetime.now():
        return None

    user = db.get_user(session["user_id"])
    if not user:
       return None

    if not user["active"]:
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
        data: str | dict | bytes = "",
    ):
        self.send_response(code)
        self.send_header('Content-type', content_type)
        self.end_headers()
        if not data:
           return

        if isinstance(data, dict) or isinstance(data, list) :
            return self.wfile.write(json.dumps(data).encode('utf-8'))

        self.wfile.write(data.encode('utf-8') if isinstance(data, str) else data)

    def do_GET(self):
        if self.path.startswith("/api"):
            user = get_user_from_token(self.headers.get('Cookie'))
            if not user:
                return self._set_response(
                    code=401,
                    content_type='application/json',
                    data={"error": "Invalid token"},
                )

            endpoint = self.path.replace("/api/", "")
            if endpoint in get_endpoints:
                try:
                    response_code, response_data = get_endpoints[endpoint](user, {})
                    print(response_code, response_data)
                    return self._set_response(
                        code=response_code,
                        content_type='application/json',
                        data=response_data,
                    )
                except Exception as e:
                    print(f"Unexpected error: {e}")
                    return self._set_response(
                        code=500,
                        content_type='application/json',
                        data={"error": "Unexpected error"},
                    )

            return self._set_response(
                content_type='application/json',
                data={"error": "Endpoint not found"},
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
                    data={"error": "Invalid token"},
                )

            endpoint = self.path.replace("/api/", "")
            if endpoint in post_endpoints:
                try:
                    code, response = post_endpoints[endpoint](user, self._get_input_data())
                    return self._set_response(
                        code=code,
                        content_type='application/json',
                        data=response,
                    )
                except Exception as e:
                    print(f"Unexpected error: {e}")
                    return self._set_response(
                        code=500,
                        content_type='application/json',
                        data={"error": "Unexpected error"},
                    )

            return self._set_response(
                content_type='application/json',
                data={"echo": self._get_data()},
            )

httpd = HTTPServer(('', 8000), Handler)

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    pass

httpd.server_close()
