FROM astral/uv:python3.12-bookworm-slim

WORKDIR /app

ADD ./pyproject.toml /app
ADD ./uv.lock /app

RUN uv sync --locked

ADD ./src /app

CMD ["uv", "run", "uvicorn", "main:app"]