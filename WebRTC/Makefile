run:
	deno run --allow-net --allow-read server.ts

swift:
	swift client.swift

docker:
	docker compose down
	CLIENT_PASSWORD=? \
	docker compose up
