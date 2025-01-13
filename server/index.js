const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const initGame = require('./game');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

initGame(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`[SERVER] listening on port ${PORT}`));
