const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const initGame = require('./game');

const app = express();

// OPTIONAL: CSP für 'unsafe-eval' (nur falls du willst/testest)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval';");
  next();
});

// Statische Dateien ausliefern
app.use(express.static('public'));

const server = http.createServer(app);

// WebSocket-Server an das HTTP-Server-Objekt anhängen
const wss = new WebSocketServer({ server });

// Dein Spiel initialisieren
initGame(wss);

// Start
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`);
});
