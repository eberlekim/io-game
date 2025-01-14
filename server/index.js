const express = require("express");
const path = require("path");
const { WebSocketServer } = require("ws");
const { v4: uuidv4 } = require("uuid"); // optional, oder nutz was eigenes

// Eigene Module:
const { startGameLoop, getState, players, spawnPlayer } = require("./game");

const PORT = process.env.PORT || 3001;

const app = express();

// statische Files aus dem public-Ordner
app.use(express.static(path.join(__dirname, "..", "public")));

const server = app.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`);
});

// WebSocket
const wss = new WebSocketServer({ server });
console.log("[DEBUG] WebSocketServer init...");

wss.on("connection", (ws) => {
  console.log("New client connected (raw ws).");

  // Erzeuge eine clientId
  const clientId = uuidv4().slice(0, 9);
  ws.clientId = clientId;
  console.log("Assigned clientId =", clientId);

  // Sende dem Client sein clientId
  ws.send(JSON.stringify({ type: "yourId", id: clientId }));

  // Sofort im players-Objekt anlegen
  if (!players[clientId]) {
    spawnPlayer(clientId, "NoName");
  }

  // Events
  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (err) {
      console.error("[SERVER] Invalid JSON:", err);
      return;
    }

    if (msg.type === "spawnPlayer") {
      // Falls gewünscht, kannst du hier noch mal respawnen oder so
      if (!players[clientId]) {
        spawnPlayer(clientId, msg.name || "NoName");
      }
    }
  });

  ws.on("close", () => {
    console.log("WS closed for", clientId);
    // optional: players[clientId].dead = true oder remove it
  });
});

// Start game loop
startGameLoop(wss);
