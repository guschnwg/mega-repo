import os
import hashlib
import base64
import hmac

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1, dklen=64)
    return f"{base64.b64encode(salt).decode()}${base64.b64encode(key).decode()}"


def verify_password(password: str, stored_value: str) -> bool:
    salt_b64, key_b64 = stored_value.split("$")
    salt = base64.b64decode(salt_b64)
    key = base64.b64decode(key_b64)

    new_key = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1, dklen=64)
    return hmac.compare_digest(new_key, key)