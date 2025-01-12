const express = require('express');
const http = require('http');
const { Server } = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;

// Einfaches Test-Route
app.get('/', (req, res) => {
  res.send('Hallo aus Express und Socket.io!');
});

// Socket.io-Logik
io.on('connection', (socket) => {
  console.log('Ein User ist verbunden: ', socket.id);

  // Beispiel-Event: Sobald einer "message" schickt, leiten wir es an alle weiter
  socket.on('message', (text) => {
    io.emit('message', { id: socket.id, text });
  });
});

// Server starten
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


app.use(express.static('public'));