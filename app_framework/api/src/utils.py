import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode(), salt)
    return hashed.decode()

def verify_password(candidate: str, actual: str) -> bool:
    return bcrypt.checkpw(candidate.encode(), actual.encode())
