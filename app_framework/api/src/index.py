from http.server import HTTPServer

from utils import hash_password
from handler import BaseHandler
from db import Db

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

def list_beeps(user, data):
    if "admin" not in user["roles"]:
        return 403, {"error": "Unauthorized"}

    return 200, beeps

def list_places(user, data):
    return 200, places

#


db = Db(":memory")
db.migrate()
db.seed()

class Handler(BaseHandler):
    db = db

httpd = HTTPServer(('', 8000), Handler)

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    pass

httpd.server_close()
