# pyright: reportUnusedCallResult=false

import json
import sqlite3
from dataclasses import dataclass
from time import timezone
from typing import get_origin, Any, get_args, TypeVar
from datetime import datetime
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
    token: str
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
        self.cur.execute("CREATE TABLE sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token TEXT NOT NULL, refresh_token TEXT NOT NULL, valid_until DATETIME NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id))")

    def seed(self):
        self.create_user("admin@example.com", hash_password("password1"), ["admin"], True)
        self.create_user("user@example.com", hash_password("password2"), ["user"], True)
        self.create_user("inactive@example.com", hash_password("password4"), ["user"], False)
        self.create_session(1, hash_password("token"), hash_password("refresh_token"), datetime.now())

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

    def create_session(self, user_id: int, token: str, refresh_token: str, valid_until: datetime):
        return self._fetch_one(
            Session,
            "INSERT INTO sessions (user_id, token, refresh_token, valid_until) VALUES (?, ?, ?, ?) RETURNING id, user_id, token, refresh_token, valid_until",
            (user_id, token, refresh_token, valid_until)
        )

    def get_sessions(self):
        return self._fetch_all(Session, "SELECT id, user_id, token, refresh_token, valid_until FROM sessions")

    def get_session_by_token(self, token: str):
        return self._fetch_one(
            Session,
            "SELECT id, user_id, token, refresh_token, valid_until FROM sessions WHERE token = ?",
            (token,)
        )

    def delete_session_by_token(self, token: str):
        self.cur.execute("DELETE FROM sessions WHERE token = ?", (token,))

    def delete_session(self, session_id: int):
        self.cur.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
