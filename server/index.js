const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const initGame = require('./game');

const app = express();

// CSP-Middleware: Erlaubt (testweise) unsafe-eval
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval';");
  next();
});

const server = http.createServer(app);
const io = new Server(server);

// Statische Dateien bereitstellen
app.use(express.static('public'));

// Dein Spiel initialisieren
initGame(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[SERVER] listening on port ${PORT}`);
});


