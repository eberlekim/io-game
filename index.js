// index.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;

// Statische Dateien aus 'public' bereitstellen
app.use(express.static('public'));

// Socket.io-Logik
io.on('connection', (socket) => {
  console.log('Ein User ist verbunden:', socket.id);

  // Wenn ein Client seine Cursor-Position sendet:
  socket.on('cursor', (data) => {
    // data = { x, y }
    // Wir schicken das direkt an ALLE (inkl. dem Sender) zurück
    io.emit('cursor', {
      id: socket.id,
      x: data.x,
      y: data.y
    });
  });

  // Beim Disconnect
  socket.on('disconnect', () => {
    // Teilt allen mit, dass dieser Spieler weg ist
    io.emit('playerDisconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
