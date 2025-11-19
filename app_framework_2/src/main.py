from datetime import datetime

from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route

from db import Db
from crypto import hash_password


db = Db()
db.migrate()
db.seed()

async def homepage(request):
    new_session = db.create_session(1, hash_password("token"), hash_password("refresh"), datetime.now())
    return JSONResponse({
        "users": [u.model_dump() for u in db.get_users()],
        "sessions": [u.model_dump() for u in db.get_sessions()],
        "create_session": new_session.model_dump(),
        "session": db.get_session_by_token(new_session.token).model_dump(),
    })

app = Starlette(debug=True, routes=[
    Route('/', homepage),
])
