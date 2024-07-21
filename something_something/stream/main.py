import asyncio
import time
import cv2
from mjpeg_streamer import MjpegServer, Stream
from onvif import ONVIFCamera
import threading
from aiohttp import web
import base64

import os

STREAM_URL = os.getenv("STREAM_URL", "")
START_LIVE = bool(os.getenv("START_LIVE", ""))

HOST = os.getenv("HOST", "")
PORT = int(os.getenv("PORT", "80") or "80")
STREAM_USER = os.getenv("STREAM_USER", "")
STREAM_PASSWORD = os.getenv("STREAM_PASSWORD", "")
ONVIF_USER = os.getenv("ONVIF_USER", "")
ONVIF_PASSWORD = os.getenv("ONVIF_PASSWORD", "")
WSDL = os.getenv("WSDL", "/usr/local/lib/python3.11/site-packages/wsdl/")
RTSP_PATH = os.getenv("RTSP_PATH", "/cam/realmonitor?channel=1&subtype=0")

print(f"""
STREAM_URL: {STREAM_URL}
START_LIVE: {START_LIVE}
HOST: {HOST}
PORT: {PORT}
STREAM_USER: {STREAM_USER}
STREAM_PASSWORD: {STREAM_PASSWORD}
ONVIF_USER: {ONVIF_USER}
ONVIF_PASSWORD: {ONVIF_PASSWORD}
WSDL: {WSDL}
RTSP_PATH: {RTSP_PATH}
""")

server = MjpegServer("0.0.0.0", 8080)

if STREAM_URL:
    cap = cv2.VideoCapture(STREAM_URL)
else:
    cap = cv2.VideoCapture(f'rtsp://{STREAM_USER}:{STREAM_PASSWORD}@{HOST}:{PORT}{RTSP_PATH}')

stream = Stream("my_camera", size=(1366, 768), quality=50, fps=60)
server.add_stream(stream)

is_live = START_LIVE

def move(x, y, timeout):
    mycam = ONVIFCamera(HOST, PORT, ONVIF_USER, ONVIF_PASSWORD, WSDL, adjust_time=True)
    ptz_service = mycam.create_ptz_service()
    media_service = mycam.create_media_service()
    media_profile = media_service.GetProfiles()[0]

    thread = threading.Thread(
        target=ptz_service.ContinuousMove,
        args=({
            'ProfileToken': media_profile.token, 'Velocity': {'PanTilt': {'x': x, 'y': y}}, 'Timeout': timeout
        },),
        daemon=True
    )
    thread.start()

def stop():
    mycam = ONVIFCamera(HOST, PORT, ONVIF_USER, ONVIF_PASSWORD, WSDL, adjust_time=True)
    ptz_service = mycam.create_ptz_service()
    media_service = mycam.create_media_service()
    media_profile = media_service.GetProfiles()[0]

    thread = threading.Thread(
        target=ptz_service.Stop,
        args=({'ProfileToken': media_profile.token},),
        daemon=True
    )
    thread.start()

def turn(x, y, timeout, wait):
    def inner():
        move(x, y, timeout)
        time.sleep(wait)
        stop()

    thread = threading.Thread(target=inner, daemon=True)
    thread.start()

async def reset():
    global is_live, cap

    is_live = False

    await asyncio.sleep(5)

    cap = cv2.VideoCapture(f'rtsp://{STREAM_USER}:{STREAM_PASSWORD}@{HOST}:{PORT}{RTSP_PATH}')

    await asyncio.sleep(5)

    is_live = True

class TurnHandler:
    async def __call__(self, request: web.Request) -> web.StreamResponse:
        x = request.rel_url.query.get("x", 0)
        y = request.rel_url.query.get("y", 0)
        timeout = request.rel_url.query.get("timeout", 0)
        wait = request.rel_url.query.get("wait", 0)

        turn(float(x), float(y), int(timeout), int(wait))

        headers = {"Content-Type": "application/json"}
        response = web.StreamResponse(status=200, reason="OK", headers=headers)
        await response.prepare(request)
        await response.write(b"{}")

        return response

class OnHandler:
    async def __call__(self, request: web.Request) -> web.StreamResponse:
        global is_live
        is_live = True

        headers = {"Content-Type": "application/json"}
        response = web.StreamResponse(status=200, reason="OK", headers=headers)
        await response.prepare(request)
        await response.write(b"{}")

        return response

class OffHandler:
    async def __call__(self, request: web.Request) -> web.StreamResponse:
        global is_live
        is_live = False

        headers = {"Content-Type": "application/json"}
        response = web.StreamResponse(status=200, reason="OK", headers=headers)
        await response.prepare(request)
        await response.write(b"{}")

        return response

class ResetHandler:
    async def __call__(self, request: web.Request) -> web.StreamResponse:
        await reset()

        headers = {"Content-Type": "application/json"}
        response = web.StreamResponse(status=200, reason="OK", headers=headers)
        await response.prepare(request)
        await response.write(b"{}")

        return response

def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

class WebSocketHandler:
    clients: dict[str, web.WebSocketResponse] = {}

    async def handle_hello(self, ws: web.WebSocketResponse, new_client: str):
        who_is_here = ",".join(self.clients.keys())

        await ws.send_str(f"hello|{new_client}|{who_is_here}")
        for client in self.clients.values():
            try:
                await client.send_str(f"new_client|{who_is_here},{new_client}")
            except:
                pass

        self.clients[new_client] = ws

    async def handle_frame(self, ws: web.WebSocketResponse, width: int, height: int, buffer_size: int):
        try:
            resized_image = cv2.resize(stream._frame, (width, height))
            _, buffer = cv2.imencode('.jpg', resized_image, [cv2.IMWRITE_JPEG_QUALITY, 80])
            message = base64.b64encode(buffer).decode()

            for chunk in chunks(message, buffer_size):
                await ws.send_str(f"chunk|{chunk}")
        except:
            pass

        await ws.send_str("chunk|DONE")

    async def __call__(self, request: web.Request) -> web.WebSocketResponse:
        ws = web.WebSocketResponse()
        await ws.prepare(request)

        while True:
            try:
                msg = await ws.receive()

                if msg.type == web.WSMsgType.TEXT:
                    type, rest = msg.data.strip().split("|", maxsplit=1)

                    if type == "hello":
                        await self.handle_hello(ws, rest)

                    elif type == "frame":
                        width, height, buffer_size = rest.split("|")
                        await self.handle_frame(ws, int(width), int(height), int(buffer_size))

                    elif type == "turn":
                        x, y, timeout, wait = rest.split("|")
                        turn(float(x), float(y), int(timeout), int(wait))

                    elif type == "move":
                        x, y, timeout = rest.split("|")
                        move(float(x), float(y), int(timeout))

                    elif type == "stop":
                        stop()

                    elif type == "reset":
                        await reset()

                    if msg.data == "close":
                        await ws.close()
                        self.clients.pop(ws, None)
                elif msg.type == web.WSMsgType.ERROR:
                    print("ws connection closed with exception %s" % ws.exception())
                elif msg.type == web.WSMsgType.CLOSE:
                    self.clients.pop(ws, None)
                    break
            except Exception as e:
                print(f"Error {e.__class__} {e}")
                break

        return ws

class WebSocketUIHandler:
    async def __call__(self, request: web.Request) -> web.StreamResponse:
        headers = {"Content-Type": "text/html"}
        response = web.StreamResponse(status=200, reason="OK", headers=headers)
        await response.prepare(request)
        with open("index.html", "r") as f:
            await response.write(f.read().encode())
        return response

server._app.router.add_route("GET", "/turn", TurnHandler())
server._app.router.add_route("GET", "/on", OnHandler())
server._app.router.add_route("GET", "/off", OffHandler())
server._app.router.add_route("GET", "/reset", ResetHandler())
server._app.router.add_route("GET", "/ws", WebSocketHandler())
server._app.router.add_route("GET", "/ws-ui", WebSocketUIHandler())
server.start()

def update_stream():
    while True:
        if not is_live:
            continue

        ret, frame = cap.read()
        if not ret:
            continue

        stream.set_frame(frame)

threading.Thread(target=update_stream).start()
