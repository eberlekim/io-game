// index.js
// ---------------------------------------------------------------
// Main server script that:
// 1. Sets up web server + static files
// 2. Creates a WebSocket server
// 3. Spawns new players & handles their input
// 4. Sends out game updates

const express = require('express');
const path = require('path');
const { WebSocketServer } = require('ws');
const { spawnPlayer, removePlayer, getGameState, startGameLoop, spawnNPCs, players } = require('./game');
const { v4: uuidv4 } = require('uuid');
const http = require('http');





// (NEW) Import your server classes or a getClassData function
const BaseClass = require('./classes/BaseClass');
const BoosterClass = require('./classes/BoosterClass');
const NpcClass = require('./classes/NpcClass');
// If you have more classes, import them as well
// const SpikeClass = require('./classes/SpikeClass');

function getClassData(type) {
  if (type === 'BaseClass') return BaseClass;
  if (type === 'BoosterClass') return BoosterClass;
  if (type === 'NpcClass')  return NpcClass;
  return null;
}






const PORT = process.env.PORT || 3001;
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.get('/hello', (req, res) => {
  res.send("IO-Game Server is running on express + ws");
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Handle new player connections
wss.on('connection', (ws) => {
  console.log("New client connected via WS");

  // Create unique ID for new player
  const clientId = uuidv4().slice(0, 8) + "-";
  console.log("Assigned clientId =", clientId);

  // Create new player in game
  spawnPlayer(clientId, "unbenannt");  // "unbenannt" = "unnamed" in German

  // Tell player their ID
  ws.send(JSON.stringify({ type: "yourId", id: clientId }));

  // Send game state 60 times/sec
  const interval = setInterval(() => {
    const state = getGameState();
    const payload = {
      type: "state",
      players: {}
    };

    for (let pid in state.players) {
      const p = state.players[pid];
      
      // Find the class data for this player's classType
      const cd = getClassData(p.classType);

      payload.players[pid] = {
        id: p.id,
        x: p.x,
        y: p.y,
        vx: p.vx,
        vy: p.vy,
        dead: p.dead,
        isAi: p.isAi,
        name: p.name,
        score: p.score,
        level: p.level,
        classType: p.classType,

        // (NEW) Send shapes array so client can debug-render hitboxes
        shapes: cd ? cd.shapes : []
      };
    }

    try {
      ws.send(JSON.stringify(payload));
    } catch (e) {
      // Connection closed
    }
  }, 1000 / 60);

  // Handle incoming messages
  ws.on('message', (msg) => {
    console.log("Server received raw message:", msg.toString()); // Debug log
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }
    if (data.type === "input") {
      const p = players[clientId];
      if (!p) return;
      
      if (typeof data.up === 'boolean') p.up = data.up;
      if (typeof data.down === 'boolean') p.down = data.down;
      if (typeof data.left === 'boolean') p.left = data.left;
      if (typeof data.right === 'boolean') p.right = data.right;
      if (data.switchClass === true) {
        p.switchClass();
      }
    }
  });

  // Handle disconnect
  ws.on('close', () => {
    console.log("Client disconnected", clientId);
    clearInterval(interval);
    removePlayer(clientId);
  });
});

server.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`);
});

// Start the game loop & spawn some NPCs
startGameLoop();
spawnNPCs();
