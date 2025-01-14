const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const initGame = require('./game');

const app = express();

// OPTIONAL: testweise CSP (kannst du entfernen, wenn du willst)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval';");
  next();
});

// Statische Dateien
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Hier initialisieren wir dein Spiel (NPCs, Physics, etc.)
initGame(wss);

// ACHTUNG: Nur process.env.PORT! (kein fallback)
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`);
});
