# Creating the proxy

## Locally

```shell
mitmdump --mode regular@8081
rm -rf .mitmproxy && mkdir -p .mitmproxy && cp ~/.mitmproxy .mitmproxy
```

We need to set the certificates in a locatino that we can use, so we copy it to here (should we link instead?)

## In the docker container

```shell
docker compose up proxy
```

The volume copy the certificates locally

# Using the proxy

## Locally

```shell
curl -x http://localhost:8081 --cacert .mitmproxy/mitmproxy-ca-cert.pem https://google.com
```

## With some random container

```shell
docker run -v $(pwd)/.mitmproxy/:/etc/ssl/certs/mitmproxy:ro -it python:3.11.6-alpine sh
...
apk add curl
curl -x host.docker.internal:8081 --cacert /etc/ssl/certs/mitmproxy/mitmproxy-ca-cert.pem https://google.com
```

Mount the local certificates folder remotely and use it

## In the server container

```shell
docker compose run -v $(pwd)/.mitmproxy:/root/.mitmproxy:consistent server sh
...
curl -x proxy:8081 --cacert /root/.mitmproxy/mitmproxy-ca-cert.pem https://google.com
```

Mount the local certificates folder remotely and use it

```shell
docker compose up server
```

The volumes are mounted automatically
