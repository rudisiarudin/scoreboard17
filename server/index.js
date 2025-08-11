const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3001;
const wss = new WebSocketServer({ port: PORT });

let latestState = null;

wss.on('connection', (ws) => {
  if (latestState) { try { ws.send(JSON.stringify(latestState)); } catch {} }
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === 'ping') return;
      if (data.type === 'state') {
        latestState = { type: 'state', payload: data.payload, source: data.source };
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            try { client.send(JSON.stringify(latestState)); } catch {}
          }
        });
      }
    } catch {}
  });
});

console.log('WS server on ws://localhost:' + PORT);
