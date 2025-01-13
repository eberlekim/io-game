/***********************************************************
 * server/index.js (Server Code)
 ************************************************************/
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Statische Dateien aus dem Ordner "public" liefern
app.use(express.static('public'));

/***********************************************************
 * SPIEL-FELD UND PHYSIK-EINSTELLUNGEN
 ************************************************************/
const FIELD_WIDTH = 2000;
const FIELD_HEIGHT = 2000;
const ACCELERATION = 0.2; // Tastenbeschleunigung
const FRICTION = 0.98;    // "Eis-Effekt": 1 => rutscht ewig, 0 => bremst sofort
const PLAYER_RADIUS = 10; // Radius eines Spieler-Kreises
const BOOST_STRENGTH = 1.5;   // Extra Multiplikator für den Schub
const BOOST_COOLDOWN = 5000;  // 5 Sekunden

/***********************************************************
 * SPIELER-DATENSTRUKTUR
 * { socketId: { x, y, vx, vy, up, down, left, right,
 *               lastBoostTime, canBoost } }
 ************************************************************/
const players = {};

/***********************************************************
 * Socket.io-Verbindung
 ************************************************************/
io.on('connection', (socket) => {
  console.log('Neuer Spieler verbunden:', socket.id);

  // Spieler anlegen
  players[socket.id] = {
    x: Math.random() * FIELD_WIDTH - FIELD_WIDTH / 2, // Position irgendwo
    y: Math.random() * FIELD_HEIGHT - FIELD_HEIGHT / 2,
    vx: 0,
    vy: 0,
    up: false,
    down: false,
    left: false,
    right: false,
    boost: false,
    lastBoostTime: 0 // Zeitstempel des letzten Boosts
  };

  // Wenn Client WASD oder Space ändert
  socket.on('moveKeys', (keys) => {
    // keys = { up, down, left, right, boost }
    if (players[socket.id]) {
      players[socket.id].up    = keys.up;
      players[socket.id].down  = keys.down;
      players[socket.id].left  = keys.left;
      players[socket.id].right = keys.right;
      players[socket.id].boost = keys.boost; // Space
    }
  });

  // Bei Disconnect
  socket.on('disconnect', () => {
    console.log('Spieler disconnected:', socket.id);
    delete players[socket.id];
  });
});

/***********************************************************
 * SERVER-SEITIGE SPIELSCHLEIFE (60 FPS)
 ************************************************************/
const FPS = 60;
setInterval(() => {
  // 1) Physik aktualisieren
  handlePhysics();

  // 2) Zustand an alle senden
  io.emit('state', players);
}, 1000 / FPS);

/***********************************************************
 * PHYSIK-FUNKTION
 * - Beschleunigung durch WASD
 * - Boost (Space) alle 5s
 * - Reibung (FRICTION)
 * - Kreis-Kollision
 ************************************************************/
function handlePhysics() {
  // a) Geschwindigkeit & Position updaten (WASD, Boost, Friction)
  for (const id in players) {
    const p = players[id];

    // 1) Beschleunigung durch WASD
    if (p.up)    p.vy -= ACCELERATION;
    if (p.down)  p.vy += ACCELERATION;
    if (p.left)  p.vx -= ACCELERATION;
    if (p.right) p.vx += ACCELERATION;

    // 2) Boost (Leertaste)
    // Nur erlauben, wenn BOOST_COOLDOWN abgelaufen ist
    const now = Date.now();
    if (p.boost) {
      if (now - p.lastBoostTime >= BOOST_COOLDOWN) {
        // Verstärke die aktuelle Geschwindigkeit
        p.vx *= BOOST_STRENGTH;
        p.vy *= BOOST_STRENGTH;
        p.lastBoostTime = now; // Merken, wann wir geboostet haben
      }
      // boost = false setzen, damit wir nicht jedes Frame boosten
      p.boost = false;
    }

    // 3) Reibung
    p.vx *= FRICTION;
    p.vy *= FRICTION;

    // 4) Position ändern
    p.x += p.vx;
    p.y += p.vy;
  }

  // b) Kollisionsabfrage für alle Paare
  const playerIds = Object.keys(players);
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      const p1 = players[playerIds[i]];
      const p2 = players[playerIds[j]];
      resolveCollision(p1, p2);
    }
  }
}

/***********************************************************
 * KOLLISIONSFUNKTION
 *  - Elastischer Stoß für zwei gleich schwere Kreise
 *    (hier sehr vereinfacht!)
 ************************************************************/
function resolveCollision(p1, p2) {
  // Abstand zwischen p1 und p2
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Berühren sich? (Radius * 2)
  const minDist = PLAYER_RADIUS * 2;
  if (dist < minDist) {
    // Überlappung
    const overlap = minDist - dist;

    // Bewegen wir p1 und p2 auseinander (je zur Hälfte)
    const half = overlap / 2;
    // Richtung (dx, dy)
    const nx = dx / dist; // Normalisieren
    const ny = dy / dist;
    p1.x -= nx * half;
    p1.y -= ny * half;
    p2.x += nx * half;
    p2.y += ny * half;

    // Einfaches elastisches Zusammenstoßen (gleich schwere Kreise)
    // Geschwindigkeiten entlang der Kollisionsnormal austauschen
    // Für präzise Physik braucht es mehr, hier nur Minimal-Beispiel
    const tx1 = p1.vx * nx + p1.vy * ny; // Skalarprojektion p1 auf Normal
    const tx2 = p2.vx * nx + p2.vy * ny;
    const swap = tx1; 
    // Tausch
    p1.vx += (tx2 - tx1) * nx;
    p1.vy += (tx2 - tx1) * ny;
    p2.vx += (tx1 - tx2) * nx;
    p2.vy += (tx1 - tx2) * ny;
  }
}

/***********************************************************
 * SERVER STARTEN
 ************************************************************/
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
