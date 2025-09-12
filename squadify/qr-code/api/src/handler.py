from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler
import json
import secrets
from urllib.parse import parse_qsl

from utils import hash_password, verify_password
from db import Db

class BaseHandler(BaseHTTPRequestHandler):
    db: Db

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

    #

    def _login(self, data):
        possible_user = self.db.get_user_by_email_with_password(data["email"])
        if not possible_user or not possible_user["active"]:
            return None

        if not verify_password(data["password"], possible_user["password"]):
            return None

        return self.db.create_session(possible_user["id"], secrets.token_urlsafe(16), datetime.now() + timedelta(hours=1))

    def _get_user_from_token(self, cookie):
        if not cookie or "session=" not in cookie:
            return None

        token = cookie.split("session=")[1].split(";")[0]
        if not token:
            return None

        session = self.db.get_session_by_token(token)
        if not session:
            return None

        if session["valid_until"] < datetime.now():
            return None

        user = self.db.get_user(session["user_id"])
        if not user:
            return None

        if not user["active"]:
            return None

        return user

    #

    def GET_me(self, user, data):
        return 200, user

    def GET_list_users(self, user, data):
        if "admin" not in user["roles"]:
            return 403, {"error": "Unauthorized"}

        return 200, self.db.get_users()

    #

    def POST_create_user(self, user, data):
        if "admin" not in user["roles"]:
            return 403, {"error": "Unauthorized"}

        existing_user = self.db.get_user_by_email(data["email"])
        if existing_user:
            return 409, {"error": "Email already exists"}

        return 201, self.db.create_user(data["email"], hash_password(data["password"]), data.get("roles") or ["user"], True)

    def POST_update_user(self, user, data):
        if "admin" not in user["roles"]:
            return 403, {"error": "Unauthorized"}

        user_to_update = self.db.get_user_with_password(data["id"])
        if not user_to_update:
            return 404, {"error": "User not found"}

        updated_user = self.db.update_user(
            data["id"],
            data["email"] if "email" in data else user_to_update["email"],
            hash_password(data["password"]) if "password" in data else user_to_update["password"],
            data["roles"] if "roles" in data else user_to_update["roles"],
            data["active"] if "active" in data else user_to_update["active"]
        )

        return 200, updated_user

    #

    def do_GET(self):
        if self.path.startswith("/api"):
            user = self._get_user_from_token(self.headers.get('Cookie'))
            if not user:
                return self._set_response(
                    code=401,
                    content_type='application/json',
                    data={"error": "Invalid token"},
                )

            endpoint = self.path.replace("/api/", "")
            if hasattr(self, f"GET_{endpoint}"):
                try:
                    code, data = getattr(self, f"GET_{endpoint}")(user, {})
                    return self._set_response(
                        code=code,
                        content_type='application/json',
                        data=data,
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
        if self.path == "/login":
            session = self._login(self._get_input_data())
            if not session:
                self.send_response(302)
                self.send_header("Location", "/login")
                return self.end_headers()

            self.send_response(302)
            self.send_header('Set-Cookie', f"session={session['token']}; HttpOnly; Secure; SameSite=Strict; Path=/")
            self.send_header("Location", "/")
            return self.end_headers()

        if self.path.startswith("/api/"):
            user = self._get_user_from_token(self.headers.get('Cookie'))
            if not user:
                return self._set_response(
                    code=401,
                    content_type='application/json',
                    data={"error": "Invalid token"},
                )

            endpoint = self.path.replace("/api/", "")
            if hasattr(self, f"POST_{endpoint}"):
                try:
                    code, data = getattr(self, f"POST_{endpoint}")(user, self._get_input_data())
                    return self._set_response(
                        code=code,
                        content_type='application/json',
                        data=data,
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

