# pyright: reportAny=false
# pyright: reportExplicitAny=false
# pyright: reportUnusedCallResult=false

from datetime import datetime
import json
from dataclasses import dataclass
import sqlite3
from typing import Any

from utils import hash_password, BaseClass, BaseClassType

@dataclass
class User(BaseClass):
    id: int
    email: str
    roles: list[str] | None = None
    active: bool | None = None
    password: str | None = None

@dataclass
class UserWithPassword(BaseClass):
    id: int
    email: str
    password: str
    roles: list[str] | None = None
    active: bool | None = None

@dataclass
class Session(BaseClass):
    id: int
    user_id: int
    valid_until: datetime
    token: str | None = None


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
        self.cur.execute("CREATE TABLE sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token TEXT NOT NULL, valid_until DATETIME NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id))")

    def seed(self):
        self.create_user("admin@example.com", hash_password("password1"), ["admin"], True)
        self.create_user("user@example.com", hash_password("password2"), ["user"], True)
        self.create_user("inactive@example.com", hash_password("password4"), ["user"], False)

    def get_users(self):
        return self._fetch_all(User, "SELECT id, email, roles, active FROM users")

    def get_user(self, user_id: int):
        return self._fetch_one(User, "SELECT id, email, roles, active FROM users WHERE id = ?", (user_id,))

    def get_user_with_password(self, user_id: int):
        return self._fetch_one(UserWithPassword, "SELECT id, email, roles, active, password FROM users WHERE id = ?", (user_id,))

    def get_user_by_email(self, email: str):
        return self._fetch_one(User, "SELECT id, email, roles, active FROM users WHERE email = ?", (email,))

    def get_user_by_email_with_password(self, email: str):
        return self._fetch_one(UserWithPassword, "SELECT id, email, roles, active, password FROM users WHERE email = ?", (email,))

    def create_user(self, email: str, password: str, roles: list[str] | None, active: bool):
        return self._fetch_one(
            User,
            "INSERT INTO users (email, password, roles, active) VALUES (?, ?, ?, ?) RETURNING id, email, roles, active",
            (email, password, json.dumps(roles) if roles is not None else [], active)
        )

    def update_user(self, user_id: int, email: str, password: str, roles: list[str] | None, active: bool):
        return self._fetch_one(
            User,
            "UPDATE users SET email = ?, password = ?, roles = ?, active = ? WHERE id = ? RETURNING id, email, roles, active",
            (email, password, json.dumps(roles) if roles is not None else [], active, user_id)
        )

    def create_session(self, user_id: int, token: str, valid_until: datetime):
        return self._fetch_one(
            Session,
            "INSERT INTO sessions (user_id, token, valid_until) VALUES (?, ?, ?) RETURNING id, user_id, token, valid_until",
            (user_id, token, valid_until)
        )

    def get_session_by_token(self, token: str):
        return self._fetch_one(
            Session,
            "SELECT id, user_id, valid_until FROM sessions WHERE token = ?",
            (token,)
        )

    def delete_session_by_token(self, token: str):
        _ = self.cur.execute("DELETE FROM sessions WHERE token = ?", (token,))

    def delete_session(self, session_id: int):
        _ = self.cur.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
