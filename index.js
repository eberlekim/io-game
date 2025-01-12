const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;

// Statische Dateien aus dem public-Ordner
app.use(express.static('public'));

// Socket.io-Logik
io.on('connection', (socket) => {
  console.log('Ein User ist verbunden: ', socket.id);
  
  socket.on('message', (text) => {
    io.emit('message', { id: socket.id, text });
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
