// This is the main server script that:
// 1. Sets up the web server to serve game files
// 2. Handles WebSocket connections for real-time gameplay
// 3. Manages communication between players and the game
// 4. Sends game updates to all connected players

// Import required packages and game components
const express = require('express');
const path = require('path');
const { WebSocketServer } = require('ws');
const { spawnPlayer, removePlayer, getGameState, startGameLoop, spawnNPCs, players } = require('./game');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

// Set up server port and create web server
const PORT = process.env.PORT || 3001;
const app = express();

// Serve static files from public folder (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../public')));

// Simple test route to check if server is running
app.get('/hello', (req, res) => {
  res.send("IO-Game Server is running on express + ws");
});

// Create HTTP server
const server = http.createServer(app);

// Set up WebSocket server for real-time communication
const wss = new WebSocketServer({ server });

// Handle new player connections
wss.on('connection', (ws) => {
  console.log("New client connected via WS");

  // Create unique ID for new player
  const clientId = uuidv4().slice(0, 8) + "-";
  console.log("Assigned clientId =", clientId);

  // Create new player in game
  spawnPlayer(clientId, "unbenannt");  // "unbenannt" means "unnamed" in German

  // Tell player their ID
  ws.send(JSON.stringify({ type: "yourId", id: clientId }));

  // Send game state to player 60 times per second
  const interval = setInterval(() => {
    const state = getGameState();
    const payload = {
      type: "state",
      players: {}
    };

    
    // Send only necessary player data
    for (let pid in state.players) {
      const p = state.players[pid];
      payload.players[pid] = {
        id: p.id,
        x: p.x,           // Position X
        y: p.y,           // Position Y
        vx: p.vx,         // Velocity X
        vy: p.vy,         // Velocity Y
        dead: p.dead,     // Is player dead?
        isAi: p.isAi,     // Is this an NPC?
        name: p.name,     // Player name
        score: p.score,   // Player score
        level: p.level,   // Player level
        classType: p.classType
      };
    }
    try {
      ws.send(JSON.stringify(payload));
    } catch (e) {
      // Connection already closed
    }
  }, 1000 / 60);  // 60 times per second

  // Handle messages from player
  ws.on('message', (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }
    // Handle player input (WASD keys)
    if (data.type === "input") {
      const p = players[clientId];
      if (!p) return;
      if (typeof data.up === 'boolean') p.up = data.up;
      if (typeof data.down === 'boolean') p.down = data.down;
      if (typeof data.left === 'boolean') p.left = data.left;
      if (typeof data.right === 'boolean') p.right = data.right;
    }
  });

  // Handle player disconnect
  ws.on('close', () => {
    console.log("Client disconnected", clientId);
    clearInterval(interval);
    removePlayer(clientId);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`);
});

// Start the game loop and create NPCs
startGameLoop();  // Start physics and game updates
spawnNPCs();      // Create AI-controlled characters
