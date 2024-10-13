run:
	deno run --allow-net --allow-read server.ts

swift:
	swift client.swift

docker:
	docker compose down \
	TUNNEL_TOKEN=? \
	CLIENT_PASSWORD=? \
	STREAM_PASSWORD=? \
	docker compose up
