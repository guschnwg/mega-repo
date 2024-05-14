run:
	docker compose up -d

ngrok: TOKEN?=$(shell op item get NGrok --vault Private --format json | op item get - --fields label="authtoken")
ngrok: DOMAIN?=$(shell op item get NGrok --vault Private --format json | op item get - --fields label="domain")
ngrok:
	ngrok config add-authtoken $(TOKEN)
	ngrok http --domain=$(DOMAIN) 9999
