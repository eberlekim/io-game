/***********************************************************
 * server/index.js
 *   - Entry Point für den Server
 *   - Startet Express / Socket.io
 *   - Lädt das Spiel initGame()
 ************************************************************/
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const initGame = require('./game');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Statische Dateien
app.use(express.static('public'));

// Spielinitialisierung
initGame(io);

// Server starten
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
