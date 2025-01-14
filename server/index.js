const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const initGame = require('./game');

const app = express();

// OPTIONAL: Content-Security-Policy (kannst du entfernen, wenn es stört)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval';");
  next();
});

// Statische Dateien aus 'public'
app.use(express.static('public'));

// HTTP-Server
const server = http.createServer(app);
// WebSocket-Server
const wss = new WebSocketServer({ server });

// Spiel initialisieren
initGame(wss);

// Port: lokal 3001, auf Render von process.env.PORT
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`);
});
