const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const initGame = require('./game');

const app = express();

// <-- Hier die CSP per Header lockern (Debug-Zweck)
app.use((req, res, next) => {
  // Erlaubt Skripte von 'self' sowie 'unsafe-eval'
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-eval';");
  return next();
});

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

initGame(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`[SERVER] listening on port ${PORT}`));
