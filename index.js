/***********************************************************
 * index.js (Server Code)
 ************************************************************/
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Statische Dateien aus dem Ordner "public" liefern
app.use(express.static('public'));

// Spielfeld-Einstellungen
const FIELD_WIDTH = 2000;   // Gesamtbreite des Spielfelds
const FIELD_HEIGHT = 2000;  // Gesamthöhe des Spielfelds

// Physik-Einstellungen (kannst du anpassen)
const ACCELERATION = 0.2; // wie stark beschleunigt man beim Drücken von WASD
const FRICTION = 0.98;    // "Eis-Effekt": Wert nah bei 1 -> lange Auslaufstrecke

// Daten für alle Spieler, z.B.:
// { socketId123: { x, y, vx, vy }, socketId456: { x, y, vx, vy }, ... }
const players = {};

// Socket.io-Verbindung
io.on('connection', (socket) => {
  console.log('Neuer Spieler verbunden:', socket.id);

  // Beim Beitritt legen wir Standardwerte für diesen Spieler an
  players[socket.id] = {
    x: Math.random() * FIELD_WIDTH - FIELD_WIDTH / 2, // Spawn irgendwo
    y: Math.random() * FIELD_HEIGHT - FIELD_HEIGHT / 2,
    vx: 0,
    vy: 0,
    up: false,
    down: false,
    left: false,
    right: false
  };

  // Wenn Client Tasten drückt/loslässt, speichern wir das
  socket.on('moveKeys', (keys) => {
    // keys = { up: bool, down: bool, left: bool, right: bool }
    if (players[socket.id]) {
      players[socket.id].up = keys.up;
      players[socket.id].down = keys.down;
      players[socket.id].left = keys.left;
      players[socket.id].right = keys.right;
    }
  });

  // Bei Disconnect Spieler entfernen
  socket.on('disconnect', () => {
    console.log('Spieler disconnected:', socket.id);
    delete players[socket.id];
  });
});

// SERVER-SEITIGE SPIELSCHLEIFE
const FPS = 60;
setInterval(() => {
  // 1) Physik berechnen
  for (const id in players) {
    const p = players[id];
    
    // Beschleunigung durch WASD
    if (p.up)    p.vy -= ACCELERATION;
    if (p.down)  p.vy += ACCELERATION;
    if (p.left)  p.vx -= ACCELERATION;
    if (p.right) p.vx += ACCELERATION;

    // Geschwindigkeit mit FRICTION dämpfen
    p.vx *= FRICTION;
    p.vy *= FRICTION;

    // Position ändern
    p.x += p.vx;
    p.y += p.vy;
  }

  // 2) Allen Spielern die neuen Daten senden
  io.emit('state', players);
}, 1000 / FPS);

// Server starten
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
