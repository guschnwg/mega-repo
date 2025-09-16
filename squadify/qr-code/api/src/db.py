from datetime import datetime
import json

import sqlite3

from utils import hash_password

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        value = row[idx]
        if col[0] == 'roles':
            value = json.loads(value)
        elif col[0] == 'active':
            value = bool(value)
        elif col[0] == 'valid_until':
            value = datetime.strptime(value, "%Y-%m-%d %H:%M:%S.%f")
        d[col[0]] = value
    return d

class Db:
    def __init__(self, database=":memory:"):
        self.con = sqlite3.connect(database)
        self.con.row_factory = dict_factory
        self.cur = self.con.cursor()

    def migrate(self):
        self.cur.execute("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, roles JSON NOT NULL, active BOOLEAN NOT NULL)")
        self.cur.execute("CREATE TABLE sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token TEXT NOT NULL, valid_until DATETIME NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id))")

    def seed(self):
        self.create_user("john.doe@example.com", hash_password("password1"), ["admin"], True)
        self.create_user("jane.doe@example.com", hash_password("password2"), ["user"], True)
        self.create_user("bob.smith@example.com", hash_password("password3"), ["user"], True)
        self.create_user("alice.johnson@example.com", hash_password("password4"), ["user"], False)
        self.create_user("charlie.brown@example.com", hash_password("password5"), ["user"], True)
        self.create_user("david.lee@example.com", hash_password("password6"), ["user"], True)
        self.create_user("david.lee.2@example.com", hash_password("password6"), ["user"], True)

    def get_users(self):
        self.cur.execute("SELECT id, email, roles, active FROM users")
        return self.cur.fetchall()

    def get_user(self, user_id):
        self.cur.execute("SELECT id, email, roles, active FROM users WHERE id = ?", (user_id,))
        return self.cur.fetchone()

    def get_user_with_password(self, user_id):
        self.cur.execute("SELECT id, email, roles, active, password FROM users WHERE id = ?", (user_id,))
        return self.cur.fetchone()

    def get_user_by_email(self, email):
        self.cur.execute("SELECT id, email, roles, active FROM users WHERE email = ?", (email,))
        return self.cur.fetchone()

    def get_user_by_email_with_password(self, email):
        self.cur.execute("SELECT id, email, roles, active, password FROM users WHERE email = ?", (email,))
        return self.cur.fetchone()

    def create_user(self, email, password, roles, active):
        self.cur.execute(
            "INSERT INTO users (email, password, roles, active) VALUES (?, ?, ?, ?) RETURNING id, email, roles, active",
            (email, password, json.dumps(roles), active)
        )
        return self.cur.fetchone()

    def update_user(self, user_id, email, password, roles, active):
        self.cur.execute(
            "UPDATE users SET email = ?, password = ?, roles = ?, active = ? WHERE id = ? RETURNING id, email, roles, active",
            (email, password, json.dumps(roles), active, user_id)
        )
        return self.cur.fetchone()

    def create_session(self, user_id, token, valid_until):
        self.cur.execute(
            "INSERT INTO sessions (user_id, token, valid_until) VALUES (?, ?, ?) RETURNING user_id, token, valid_until",
            (user_id, token, valid_until)
        )
        return self.cur.fetchone()

    def get_session_by_token(self, token):
        self.cur.execute("SELECT * FROM sessions WHERE token = ?", (token,))
        return self.cur.fetchone()

    def delete_session_by_token(self, token):
        self.cur.execute("DELETE FROM sessions WHERE token = ?", (token,))

    def delete_session(self, session_id):
        self.cur.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
