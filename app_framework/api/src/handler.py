# pyright: reportAny=false
# pyright: reportExplicitAny=false
# pyright: reportMissingTypeArgument=false
# pyright: reportUnknownParameterType=false
# pyright: reportUnknownMemberType=false
# pyright: reportUnusedCallResult=false

from dataclasses import asdict, dataclass, is_dataclass
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler
import json
import secrets
from urllib.parse import parse_qsl
import mimetypes
from typing import Any, final, override

from utils import hash_password, verify_password, BaseClass, BaseClassType
from db import Db, User

@final
class HandlerException(Exception):
    def __init__(self, code: int, data: Any):
        self.code = code
        self.data = data
        super().__init__()

class EnhancedJSONEncoder(json.JSONEncoder):
    @override
    def default(self, o: str | bytes):
        if is_dataclass(o):
            return asdict(o)
        return super().default(o)

@dataclass
class LoginPayload(BaseClass):
    email: str
    password: str

@dataclass
class UserUpdatePayload(BaseClass):
    id: int
    email: str | None = None
    password: str | None = None
    roles: list[str] | None = None
    active: bool | None = None

@dataclass
class UserCreatePayload(BaseClass):
    id: int
    email: str
    password: str
    roles: list[str]
    active: bool

class BaseHandler(BaseHTTPRequestHandler):
    db: Db  # pyright: ignore[reportUninitializedInstanceVariable]

    def _get_data(self):
        content_length = int(self.headers.get('Content-Length', 0))
        return self.rfile.read(content_length).decode('utf-8')

    def _get_input_data(self, klass: type[BaseClassType]) -> BaseClassType | None:
        raw_input = self._get_data()
        if self.headers.get('Content-Type') == 'application/json':
            try:
                return klass(**json.loads(raw_input))
            except json.JSONDecodeError:
                raise HandlerException(400, {"error": "Invalid JSON"})

        if self.headers.get('Content-Type') == 'application/x-www-form-urlencoded':
            try:
                return klass(**dict(parse_qsl(raw_input)))
            except ValueError:
                raise HandlerException(400, {"error": "Invalid URL-encoded data"})

        return None

    def _set_response(
        self,
        code: int = 200,
        content_type: str = 'text/html',
        data: str | dict | bytes = "",
    ):
        self.send_response(code)
        self.send_header('Content-type', content_type)
        self.end_headers()
        if not data:
           return

        if isinstance(data, dict) or isinstance(data, list) or isinstance(data, BaseClass):
            self.wfile.write(json.dumps(data, cls=EnhancedJSONEncoder).encode('utf-8'))
            return

        self.wfile.write(data.encode('utf-8') if isinstance(data, str) else data)

    #

    def _get_token(self) -> str | None:
        cookie = self.headers.get('Cookie', '')

        if not cookie or "session=" not in cookie:
            return None

        token = cookie.split("session=")[1].split(";")[0]
        if not token:
            return None

        return token

    def _get_user_from_token(self) -> User | None:
        token = self._get_token()
        if not token:
            raise HandlerException(401, {"error": "Invalid token"})

        session = self.db.get_session_by_token(token)
        if not session:
            raise HandlerException(401, {"error": "Invalid token"})

        if session.valid_until < datetime.now():
            raise HandlerException(401, {"error": "Session expired"})

        user = self.db.get_user(session.user_id)
        if not user:
            raise HandlerException(404, {"error": "User not found"})

        if not user.active:
            raise HandlerException(401, {"error": "Inactive"})

        return user

    def _delete_session(self):
        if token := self._get_token():
            self.db.delete_session_by_token(token)

    def _json(self, code: int, data: Any):
        self._set_response(
            code=code,
            content_type='application/json',
            data=data,
        )

    def _to_login(self):
        self.send_response(302)
        self.send_header("Location", "/login")
        return self.end_headers()

    #

    def GET__logout(self):
        self._delete_session()
        self.send_response(302)
        self.send_header("Location", "/")
        return self.end_headers()

    def GET__api__me(self):
        return self._json(200, self._get_user_from_token())

    def GET__api__list_users(self):
        user = self._get_user_from_token()
        if not user or not user.roles or "admin" not in user.roles:
            raise HandlerException(403, {"error": "Unauthorized"})

        return self._json(200, self.db.get_users())

    #

    def POST__login(self):
        data = self._get_input_data(LoginPayload)
        if not data:
            return self._to_login()

        possible_user = self.db.get_user_by_email_with_password(data.email)
        if not possible_user or not possible_user.active:
            return self._to_login()

        if not verify_password(data.password, possible_user.password):
            return self._to_login()

        session = self.db.create_session(possible_user.id, secrets.token_urlsafe(16), datetime.now() + timedelta(hours=1))
        if not session:
            return self._to_login()

        self.send_response(302)
        self.send_header('Set-Cookie', f"session={session.token}; HttpOnly; Secure; SameSite=Strict; Path=/")
        self.send_header("Location", "/")
        return self.end_headers()

    def POST__api__create_user(self):
        user = self._get_user_from_token()
        if not user or not user.roles or "admin" not in user.roles:
            raise HandlerException(403, {"error": "Unauthorized"})

        data = self._get_input_data(UserCreatePayload)
        if not data:
            raise HandlerException(400, {"error": "Invalid request"})

        existing_user = self.db.get_user_by_email(data.email)
        if existing_user:
            raise HandlerException(409, {"error": "Email already exists"})

        new_user = self.db.create_user(
            data.email, hash_password(data.password), data.roles or ["user"], True
        )
        return self._json(201, new_user)

    def POST__api__update_user(self):
        user = self._get_user_from_token()
        if not user or not user.roles or "admin" not in user.roles:
            raise HandlerException(403, {"error": "Unauthorized"})

        data = self._get_input_data(UserUpdatePayload)
        if not data:
            raise HandlerException(400, {"error": "Invalid request"})

        user_to_update = self.db.get_user_with_password(data.id)
        if not user_to_update:
            raise HandlerException(404, {"error": "User not found"})

        updated_user = self.db.update_user(
            data.id,
            data.email if data.email is not None else user_to_update.email,
            hash_password(data.password) if data.password is not None else user_to_update.password,
            data.roles if data.roles is not None else user_to_update.roles,
            bool(data.active if data.active is not None else user_to_update.active)
        )

        return self._json(200, updated_user)

    #

    def do_GET(self):
        method_name = self.path.replace("/", "__")
        method_name = f"GET{method_name}"
        if hasattr(self, method_name):
            try:
                return getattr(self, method_name)()
            except HandlerException as e:
                return self._json(e.code, e.data)
            except Exception as e:
                print(f"Unexpected error: {e}")
                return self._json(500, {"error": "Unexpected error"})

        if self.path.startswith("/dist"):
            with open(f'/app{self.path}', 'rb') as file:
                mime_type, _ = mimetypes.guess_type(self.path)
                mime_type = mime_type or "text/plain"
                return self._set_response(data=file.read(), content_type=mime_type)

        with open('/app/index.html', 'rb') as file:
            return self._set_response(data=file.read())

    def do_POST(self):
        method_name = self.path.replace("/", "__")
        method_name = f"POST{method_name}"
        if hasattr(self, method_name):
            try:
                return getattr(self, method_name)()
            except HandlerException as e:
                return self._json(e.code, e.data)
            except Exception as e:
                print(f"Unexpected error: {e}")
                return self._json(500, {"error": "Unexpected error"})

        return self._set_response(
            content_type='application/json',
            data={"echo": self._get_data()},
        )

