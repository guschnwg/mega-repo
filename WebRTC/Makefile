run:
	deno run --allow-net --allow-read server.ts

swift:
	swift client.swift

docker:
	docker compose down; \
	TUNNEL_TOKEN=? \
	WS_HOST=? \
	CLIENT_PASSWORD=? \
	STREAM_URL=? \
	docker compose up
