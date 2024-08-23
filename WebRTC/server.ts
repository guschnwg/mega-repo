const port = 8080;

const clients: WebSocket[] = [];
const broadcast = (socket: WebSocket, message: any) => {
  clients.filter(client => client !== socket).forEach(client => client.send(JSON.stringify(message)))
};

const handler = (request: Request): Response => {
  console.log(`Request received: ${request.url}`);
  const url = new URL(request.url);
  if (url.pathname === "/") {
    const html = Deno.readTextFileSync("./index.html");
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }

  if (url.pathname === "/ws") {
    const { socket, response } = Deno.upgradeWebSocket(request);

    socket.addEventListener("open", () => {
      console.log("a client connected!");
      clients.push(socket);
    });

    socket.addEventListener("close", () => {
      console.log("a client disconnected!");
      const index = clients.indexOf(socket);
      clients.splice(index, 1);
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "offer") {
        broadcast(socket, { type: "offer", offer: data.offer });
      } else if (data.type === "answer") {
        broadcast(socket, { type: "answer", answer: data.answer });
      } else if (data.type === "candidate") {
        broadcast(socket, { type: "candidate", candidate: data.candidate });
      }
    });
    
    return response;
  }

  return new Response("Not found", { status: 404 });
};

console.log(`HTTP server running. Access it at: http://localhost:8080/`);
Deno.serve({ port }, handler);
