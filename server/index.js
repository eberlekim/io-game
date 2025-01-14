const express = require('express');
const path = require('path');
const { WebSocketServer } = require('ws');
const { spawnPlayer, removePlayer, getGameState, startGameLoop, spawnNPCs, players } = require('./game');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

const PORT = process.env.PORT || 3001;
const app = express();

// Statische Dateien ausliefern (public/ Ordner)
app.use(express.static(path.join(__dirname, '../public')));

// Einfache Route
app.get('/hello', (req, res) => {
  res.send("IO-Game Server is running on express + ws");
});

// Erstelle HTTP-Server
const server = http.createServer(app);

// WebSocket-Server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log("New client connected via WS");

  // Erzeuge ID
  const clientId = uuidv4().slice(0, 8) + "-";
  console.log("Assigned clientId =", clientId);

  // Player spawnen
  spawnPlayer(clientId, "unbenannt");

  // Sende yourId
  ws.send(JSON.stringify({ type: "yourId", id: clientId }));

  // State-Interval (jetzt 60x pro Sekunde)
  const interval = setInterval(() => {
    const state = getGameState();
    const payload = {
      type: "state",
      players: {}
    };
    for (let pid in state.players) {
      const p = state.players[pid];
      payload.players[pid] = {
        x: p.x,
        y: p.y,
        vx: p.vx,
        vy: p.vy,
        dead: p.dead,
        isAi: p.isAi,
        name: p.name,
        score: p.score,
        level: p.level
      };
    }
    try {
      ws.send(JSON.stringify(payload));
    } catch (e) {
      // Ws already closed
    }
  }, 1000 / 60);

  ws.on('message', (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }
    if (data.type === "spawnPlayer") {
      // Haben wir schon
    }
    else if (data.type === "input") {
      // Movement-Flags im Player speichern
      const p = players[clientId];
      if (!p) return;
      if (typeof data.up === 'boolean') p.up = data.up;
      if (typeof data.down === 'boolean') p.down = data.down;
      if (typeof data.left === 'boolean') p.left = data.left;
      if (typeof data.right === 'boolean') p.right = data.right;
    }
  });

  ws.on('close', () => {
    console.log("Client disconnected", clientId);
    clearInterval(interval);
    removePlayer(clientId);
  });
});

// Serverlisten
server.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`);
});

// Game-Loop + NPC
startGameLoop(); // 60 FPS Physics Loop (siehe game.js)
spawnNPCs();
