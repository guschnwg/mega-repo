from http.server import HTTPServer

from handler import BaseHandler
from db import Db

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
