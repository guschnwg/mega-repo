import { DurableObject } from "cloudflare:workers";

import html from "./html";

// Extend the socket to include an id
declare global {
  interface WebSocket {
    id: string;
  }
}

export class MyDurableObject extends DurableObject {
  broadcast(from: string, message: object) {
    this.ctx.getWebSockets().forEach((ws) => {
      if (ws.id !== from) {
        try {
          ws.send(JSON.stringify(message));
        } catch {
          ws.close();
        }
      }
    });
  }

  send(to: string, message: object) {
    const client = this.ctx.getWebSockets().find((ws) => ws.id === to);
    if (client) {
      try {
        client.send(JSON.stringify(message));
      } catch {
        client.close();
      }
    }
  }

  async fetch(request: Request): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    server.id = Math.random().toString(36).substring(2, 9);
    this.ctx.acceptWebSocket(server);

    this.send(server.id, { type: "welcome", id: server.id });
    this.broadcast("-1", { type: "refresh", clients: this.ctx.getWebSockets().map(ws => ws.id) });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string) {
    try {
      const data = JSON.parse(message);

      if (data.type === "ping") {

      } else if (data.type === "offer") {
        this.send(data.to, { type: "offer", from: ws.id, offer: data.offer });
      } else if (data.type === "answer") {
        this.send(data.to, { type: "answer", from: ws.id, answer: data.answer });
      } else if (data.type === "candidate") {
        this.send(data.to, {
          type: "candidate",
          from: ws.id,
          candidate: data.candidate,
        });
      }
    } catch {
      console.error(message);
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    ws.close(code, "Durable Object is closing WebSocket");
    this.broadcast("-1", { type: "refresh", clients: this.ctx.getWebSockets().map(ws => ws.id) });
  }
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (request.url.endsWith('/ws')) {
      const upgradeHeader = request.headers.get('Upgrade');
      if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Durable Object expected Upgrade: websocket', { status: 426 });
      }

      let id = env.MY_DURABLE_OBJECT.idFromName("foo");
      let stub = env.MY_DURABLE_OBJECT.get(id);

      return stub.fetch(request);
    }

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  },
} satisfies ExportedHandler<Env>;
