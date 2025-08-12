const http = require("http");
const WebSocket = require("ws");
const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Scoreboard WS alive\n");
});

const wss = new WebSocket.Server({ server });
let latestState = null;

wss.on("connection", (ws) => {
  if (latestState) ws.send(JSON.stringify({ type: "state", payload: latestState }));
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data?.type === "state") {
        latestState = data.payload;
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "state", payload: latestState }));
          }
        });
      }
    } catch {}
  });
});

server.listen(PORT, () => console.log("WS server listening on", PORT));
