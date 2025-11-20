# pyright: reportUnusedCallResult=false

import json
import sqlite3
from typing import Any
from datetime import datetime, timedelta, timezone
import json

from crypto import hash_password
from model_pydantic import BaseClass, BaseClassType

class User(BaseClass):
    id: int
    email: str
    roles: list[str]
    active: bool

class UserWithPassword(User):
    password: str

class Session(BaseClass):
    id: int
    user_id: int
    access_token: str
    refresh_token: str
    valid_until: datetime

class OAuthToken(BaseClass):
    id: int
    user_id: int
    access_token: str
    refresh_token: str
    valid_until: datetime

class Db:
    cur: sqlite3.Cursor

    def __init__(self, database: str = ":memory:"):
        con = sqlite3.connect(database)
        self.cur = con.cursor()

    def _fields(self, cursor: sqlite3.Cursor):
        return [c[0] for c in cursor.description]

    def _fetch_all(self, klass: type[BaseClassType], sql: str, params: Any = ()) -> list[BaseClassType]:
        cursor = self.cur.execute(sql, params)
        return klass.parse_many(self._fields(cursor), cursor.fetchall())

    def _fetch_one(self, klass: type[BaseClassType], sql: str, params: Any = ()) -> BaseClassType | None:
        cursor = self.cur.execute(sql, params)
        return klass.parse(self._fields(cursor), cursor.fetchone())

    def migrate(self):
        self.cur.execute("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, roles JSON NOT NULL, active BOOLEAN NOT NULL)")
        self.cur.execute("CREATE TABLE sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, access_token TEXT NOT NULL, refresh_token TEXT NOT NULL, valid_until DATETIME NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id))")
        self.cur.execute("CREATE TABLE oauth_apps (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, client_id TEXT NOT NULL, client_secret TEXT NOT NULL)")
        self.cur.execute("CREATE TABLE oauth_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, code TEXT NOT NULL, state TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id))")
        self.cur.execute("CREATE TABLE oauth_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, access_token TEXT NOT NULL, refresh_token TEXT NOT NULL, valid_until DATETIME NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id))")

    def seed(self):
        self.create_user("admin@example.com", hash_password("password1"), ["admin"], True)
        self.create_user("user@example.com", hash_password("password2"), ["user"], True)
        self.create_user("inactive@example.com", hash_password("password4"), ["user"], False)
        self.create_session(1, hash_password("token"), hash_password("refresh_token"), datetime.now())
        self.cur.execute("INSERT INTO oauth_apps (name, client_id, client_secret) VALUES ('App', '123', '456')")

    def create_user(self, email: str, password: str, roles: list[str] | None, active: bool):
        return self._fetch_one(
            User,
            """
            INSERT INTO users (email, password, roles, active) VALUES (?, ?, ?, ?)
            RETURNING id, email, roles, active
            """,
            (email, password, json.dumps(roles) if roles is not None else [], active)
        )

    def get_users(self):
        return self._fetch_all(User, "SELECT id, email, roles, active FROM users")

    def get_user_by_email_with_password(self, email: str):
        return self._fetch_one(
            UserWithPassword,
            """
            SELECT id, email, roles, active, password
            FROM users
            WHERE email = ?
            """,
            (email,)
        )

    def get_user_by_id(self, user_id: int):
        return self._fetch_one(
            User,
            """
            SELECT id, email, roles, active
            FROM users
            WHERE id = ?
            """,
            (user_id,)
        )

    def create_session(self, user_id: int, access_token: str, refresh_token: str, valid_until: datetime):
        return self._fetch_one(
            Session,
            "INSERT INTO sessions (user_id, access_token, refresh_token, valid_until) VALUES (?, ?, ?, ?) RETURNING id, user_id, access_token, refresh_token, valid_until",
            (user_id, access_token, refresh_token, valid_until)
        )

    def get_sessions(self):
        return self._fetch_all(Session, "SELECT id, user_id, access_token_token, refresh_token, valid_until FROM sessions")

    def get_session_by_token(self, access_token: str):
        return self._fetch_one(
            Session,
            "SELECT id, user_id, access_token, refresh_token, valid_until FROM sessions WHERE access_token = ?",
            (access_token,)
        )

    def get_oauth_session_by_token(self, access_token: str):
        return self._fetch_one(
            OAuthToken,
            """
            SELECT id, user_id, access_token, refresh_token, valid_until
            FROM oauth_tokens
            WHERE access_token = ?
            """,
            (access_token,)
        )

    def delete_session_by_token(self, access_token: str):
        self.cur.execute("DELETE FROM sessions WHERE access_token = ?", (access_token,))

    def delete_session(self, session_id: int):
        self.cur.execute("DELETE FROM sessions WHERE id = ?", (session_id,))

    def create_oauth_code_to_user(self, user_id: int, code: str, state: str):
        self.cur.execute("INSERT INTO oauth_codes (user_id, code, state) VALUES (?, ?, ?)", (user_id, code, state))

    def get_user_by_oauth_code(self, code: str):
        return self._fetch_one(
            User,
            """
            SELECT users.id, users.email, users.roles, users.active
            FROM users
            JOIN oauth_codes ON oauth_codes.user_id = users.id
            WHERE oauth_codes.code = ?
            """,
            (code,)
        )

    def get_user_by_refresh_token(self, refresh_token: str):
        return self._fetch_one(
            User,
            """
            SELECT users.id, users.email, users.roles, users.active
            FROM users
            JOIN oauth_tokens ON oauth_tokens.user_id = users.id
            WHERE oauth_tokens.refresh_token = ?
            """,
            (refresh_token,)
        )

    def create_oauth_token(self, user_id: int, access_token: str, refresh_token: str, expiration_seconds: int):
        return self._fetch_one(
            OAuthToken,
            """
            INSERT INTO oauth_tokens
            (user_id, access_token, refresh_token, valid_until) VALUES (?, ?, ?, ?)
            RETURNING id, user_id, access_token, refresh_token, valid_until
            """,
            (user_id, access_token, refresh_token, (datetime.now(timezone.utc) + timedelta(seconds=5)).strftime("%Y-%m-%d %H:%M:%S.%f"))
        )

    def update_oauth_token_from_refresh_token(self, user_id: int, refresh_token: str, new_access_token: str, new_refresh_token: str, expiration_seconds: int):
        return self._fetch_one(
            OAuthToken,
            """
            UPDATE oauth_tokens
            SET access_token = ?, refresh_token = ?, valid_until = ?
            WHERE user_id = ? AND refresh_token = ?
            RETURNING id, user_id, access_token, refresh_token, valid_until
            """,
            (new_access_token, new_refresh_token, (datetime.now(timezone.utc) + timedelta(seconds=5)).strftime("%Y-%m-%d %H:%M:%S.%f"), user_id, refresh_token)
        )