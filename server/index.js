const express = require("express");
const path = require("path");
const { WebSocketServer } = require("ws");
const { v4: uuidv4 } = require("uuid");

// Eigene Game-Module
const { startGameLoop, players, spawnPlayer } = require("./game");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static(path.join(__dirname, "..", "public")));

const server = app.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`);
});

// WebSocket
const wss = new WebSocketServer({ server });
console.log("[DEBUG] WebSocketServer init...");

wss.on("connection", (ws) => {
  console.log("New client connected (raw ws).");

  // Generate an ID
  const clientId = uuidv4().slice(0, 9);
  ws.clientId = clientId;
  console.log("Assigned clientId =", clientId);

  // Send yourId
  ws.send(JSON.stringify({ type: "yourId", id: clientId }));

  // Spawn the player immediately
  if (!players[clientId]) {
    spawnPlayer(clientId, "NoName");
  }

  // Listen for messages
  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (err) {
      console.error("[SERVER] Invalid JSON message =>", err);
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
    // Falls du willst, kannst du den player tot setzen oder entfernen
    // players[clientId].dead = true;
  });
});

// Start the game loop
startGameLoop(wss);
