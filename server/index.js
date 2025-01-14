const express = require("express");
const path = require("path");
const { WebSocketServer } = require("ws");
const { v4: uuidv4 } = require("uuid");

const { startGameLoop, players, spawnPlayer } = require("./game");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static(path.join(__dirname, "..", "public")));

const server = app.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`);
});

// IMPORTANT: we do NOT do "app.listen(...)" again, we pass 'server' to WebSocket
const wss = new WebSocketServer({ server });
console.log("[DEBUG] WebSocketServer init...");

wss.on("connection", (ws) => {
  console.log("New client connected (raw ws).");

  const clientId = uuidv4().slice(0, 9);
  ws.clientId = clientId;
  console.log("Assigned clientId =", clientId);

  ws.send(JSON.stringify({ type: "yourId", id: clientId }));

  // Spawn the player immediately
  if (!players[clientId]) {
    spawnPlayer(clientId, "NoName");
  }

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (err) {
      console.error("[SERVER] Invalid JSON =>", err);
      return;
    }
    if (msg.type === "spawnPlayer") {
      if (!players[clientId]) {
        spawnPlayer(clientId, msg.name || "NoName");
      }
    }
  });

  ws.on("close", () => {
    console.log("WS closed for", clientId);
    // Optionally we might remove the player from players object
  });
});

startGameLoop(wss);
