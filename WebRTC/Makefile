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
	STREAM_URL=tsp://admin:PASSWORD@192.168.0.108:80/cam/realmonitor?channel=1&subtype=0 \
	docker compose up webrtc_tunnel webrtc client

# http://localhost:5678/
docker-local:
	docker compose down; \
	WS_HOST=http://webrtc:8080 \
	CLIENT_PASSWORD=123456 \
	STREAM_URL=rtsp://stream:8554/live.stream \
	docker compose up webrtc client stream ffmpeg
