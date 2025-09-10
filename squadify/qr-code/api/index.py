from http.server import BaseHTTPRequestHandler, HTTPServer
import json

class Handler(BaseHTTPRequestHandler):
    def _set_response(self, content_type='text/html'):
        self.send_response(200)
        self.send_header('Content-type', content_type)
        self.end_headers()

    def do_GET(self):
        print("Path:", self.path)

        if self.path.startswith("/api"):
            self._set_response('application/json')
            self.wfile.write(json.dumps({"message": "GET request for {}".format(self.path)}).encode('utf-8'))
            return

        if self.path.startswith("/dist"):
            with open(f'/app{self.path}', 'rb') as file:
                self._set_response()
                self.wfile.write(file.read())
            return

        else:
            with open('/app/index.html', 'rb') as file:
                self._set_response()
                self.wfile.write(file.read())
            return

    def do_POST(self):
        if self.path.startswith("/api"):
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            print("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                    str(self.path), str(self.headers), post_data.decode('utf-8'))

httpd = HTTPServer(('', 8000), Handler)

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    pass

httpd.server_close()
