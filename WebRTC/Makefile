run:
	deno run --allow-net --allow-read server.ts

swift:
	swift client.swift

# https://webrtc.giovanna.cc
docker-cloudflare:
	docker compose down; \
	TUNNEL_TOKEN=? \
	WS_HOST=https://webrtc.giovanna.cc \
	CLIENT_PASSWORD=123456 \
	STREAM_URL="rtsp://admin:123456@192.168.0.108:80/cam/realmonitor?channel=1&subtype=0" \
	docker compose up socket tunnel client

# http://localhost:5678/
docker-local:
	docker compose down; \
	WS_HOST=http://socket:8080 \
	CLIENT_PASSWORD=123456 \
	STREAM_URL=rtsp://stream:8554/live.stream \
	docker compose up socket client stream ffmpeg
