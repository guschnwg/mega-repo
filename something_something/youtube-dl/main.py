# import youtube_dl
import yt_dlp as youtube_dl
import time
import magic

def download_video(url):
    to_return = []

    def my_hook(d):
        nonlocal to_return
        if d['status'] == 'finished':
            to_return = d['filename'].replace('./youtube-dl/download/', '')

    ydl_opts = {
        'outtmpl': './youtube-dl/download/%(extractor_key)s/%(id)s.%(ext)s',
        'progress_hooks': [my_hook],
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        # Download and save in the current directory
        ydl.download([url])

    while not to_return:
        time.sleep(1)

    return to_return

# Simple HTTP Server that receives a URL and downloads the video
# Path: something_something/youtube-dl/main.py

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
from urllib.parse import parse_qs
import json

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        url = data['url']
        response = download_video(url)
        self.send_response(200)
        self.headers.add_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def do_GET(self):
        # get file from youtube-dl/download
        with open(f'./youtube-dl/download/{self.path}', 'rb') as f:
            self.send_response(200)
            self.send_header('Content-type', magic.Magic(mime=True).from_file(f.name))
            self.end_headers()
            self.wfile.write(f.read())

# Curl command to call the server
# curl -X POST localhost:9999/route/ -H "Content-Type: application/json" --data-raw '{"url": "https://www.youtube.com/watch?v=fYVxjpqeNOE"}'
def run(server_class=HTTPServer, handler_class=SimpleHTTPRequestHandler, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting httpd on port {port}')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
