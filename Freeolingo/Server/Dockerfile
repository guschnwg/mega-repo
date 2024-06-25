FROM denoland/deno:1.43.6

EXPOSE 8080

WORKDIR /app

RUN chown -R deno /app
RUN mkdir /app/cache
RUN chown -R deno /app/cache

USER deno

COPY . .

RUN deno cache main.ts

CMD ["run", "--allow-net", "--allow-write", "--allow-read", "main.ts"]