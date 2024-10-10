const port = 8080;
const basePath = Deno.args[0] || ".";

const clients: { [id: string]: { lastPing: number, socket: WebSocket } } = {};

//

const broadcast = (from: string, message: object) => {
  Object.entries(clients).forEach(([key, { socket }]) => {
    if (key !== from) {
      try {
        socket.send(JSON.stringify(message));
      } catch {
        socket.close();
      }
    }
  });
};

const send = (to: string, message: object) => {
  const client = clients[to];
  if (client) {
    try {
      client.socket.send(JSON.stringify(message));
    } catch {
      client.socket.close();
    }
  }
};

//

const handler = (request: Request): Response => {
  const url = new URL(request.url);
  if (url.pathname === "/") {
    return new Response(
      Deno.readTextFileSync(`${basePath}/index.html`),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (url.pathname === "/ws") {
    const { socket, response } = Deno.upgradeWebSocket(request);
    const id = Math.random().toString(36).substring(2, 9);
    clients[id] = { lastPing: Date.now(), socket };

    socket.addEventListener("open", () => {
      send(id, { type: "welcome", id });
      broadcast("-1", { type: "refresh", clients: Object.keys(clients).filter(Boolean) });
    });

    socket.addEventListener("close", () => {
      delete clients[id];
      broadcast(id, { type: "refresh", clients: Object.keys(clients).filter(Boolean) });
    });

    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "ping") {
          clients[id].lastPing = Date.now();
        } else if (data.type === "offer") {
          send(data.to, { type: "offer", from: id, offer: data.offer });
        } else if (data.type === "answer") {
          send(data.to, { type: "answer", from: id, answer: data.answer });
        } else if (data.type === "candidate") {
          send(data.to, {
            type: "candidate",
            from: id,
            candidate: data.candidate,
          });
        }
      } catch {
        console.log(event.data);
        socket.close();
      }
    });

    return response;
  }

  return new Response("Not found", { status: 404 });
};

setInterval(() => {
  // const now = Date.now();
  // Object.values(clients).forEach(({ lastPing, socket }) => {
  //   if (now - lastPing > 10_000) socket.close();
  // });
}, 1000);

Deno.serve({ port }, handler);
