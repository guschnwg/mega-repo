# pyright: reportAny=false
# pyright: reportExplicitAny=false
# pyright: reportUnusedCallResult=false
# pyright: reportUnknownMemberType=false
# pyright: reportUnknownVariableType=false

from dataclasses import dataclass
from typing import get_origin, Any, get_args, TypeVar
from datetime import datetime
import json

import os
import hashlib
import base64
import hmac

def hash_password(password: str) -> str:
    """
    Hash a password using scrypt.
    Returns a single string that includes both salt and hash.
    """
    salt = os.urandom(16)  # 16 random bytes
    key = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1, dklen=64)

    # Store both salt and hash in a single string (base64-encoded)
    return f"{base64.b64encode(salt).decode()}${base64.b64encode(key).decode()}"


def verify_password(password: str, stored_value: str) -> bool:
    """
    Verify a password against a stored hash.
    """
    salt_b64, key_b64 = stored_value.split("$")
    salt = base64.b64decode(salt_b64)
    key = base64.b64decode(key_b64)

    new_key = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1, dklen=64)

    # Constant-time comparison to prevent timing attacks
    return hmac.compare_digest(new_key, key)

@dataclass
class BaseClass:
    def __post_init__(self):
        for key, field in self.__dataclass_fields__.items():
            # list -> list
            # list[str] -> list
            # list | None -> list
            t = [
                get_origin(a) or a
                for a in (get_args(field.type) or [field.type])
                if a is not type(None)
            ]
            val = getattr(self, key)
            if not val:
                continue

            if list in t or dict in t:
                setattr(self, key, json.loads(val))
            elif datetime in t:
                setattr(self, key, datetime.strptime(val, "%Y-%m-%d %H:%M:%S.%f"))
            elif bool in t:
                setattr(self, key, bool(val))

    def __bool__(self):
        return True

    @classmethod
    def parse(cls, fields: list[str], data: Any):
        if not data:
            return None

        return cls(**dict(zip(fields, data)))

    @classmethod
    def parse_many(cls, fields: list[str], data: Any):
        if not data:
            data = []

        return [cls(**dict(zip(fields, d))) for d in data]

BaseClassType = TypeVar('BaseClassType', bound=BaseClass)
