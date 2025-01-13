/***********************************************************
 * server/physics.js
 *   - Regelt Bewegung, Kollision, Boost-Anwendung
 ************************************************************/
const {
  PLAYER_RADIUS,
  ACCELERATION,
  FRICTION,
  BOOST_STRENGTH,
  BOOST_COOLDOWN
} = require('./config');

/**
 * Aktualisiert die Position und Geschwindigkeit aller Spieler.
 * Ruft danach die Kollisionsabfrage (resolveCollision) auf.
 * @param {Object} players Map { socketId: Player }
 */
function handlePhysics(players) {
  const playerIds = Object.keys(players);

  // a) Bewegung updaten
  for (const id of playerIds) {
    const p = players[id];
    
    // WASD
    if (p.up)    p.vy -= ACCELERATION;
    if (p.down)  p.vy += ACCELERATION;
    if (p.left)  p.vx -= ACCELERATION;
    if (p.right) p.vx += ACCELERATION;

    // Boost
    const now = Date.now();
    if (p.boost) {
      if (now - p.lastBoostTime >= BOOST_COOLDOWN) {
        // Geschwindigkeit verstärken
        p.vx *= BOOST_STRENGTH;
        p.vy *= BOOST_STRENGTH;
        p.lastBoostTime = now;
      }
      // Boost-Flag zurücksetzen
      p.boost = false;
    }

    // Reibung
    p.vx *= FRICTION;
    p.vy *= FRICTION;

    // Position
    p.x += p.vx;
    p.y += p.vy;
  }

  // b) Kollisionen
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      const p1 = players[playerIds[i]];
      const p2 = players[playerIds[j]];
      resolveCollision(p1, p2);
    }
  }
}

/**
 * Lässt zwei Spieler (Kreise) elastisch kollidieren,
 * wenn sie sich überlappen.
 */
function resolveCollision(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const minDist = PLAYER_RADIUS * 2;
  if (dist < minDist) {
    // Überlappung
    const overlap = minDist - dist;
    const half = overlap / 2;

    // Normalisieren
    const nx = dx / dist;
    const ny = dy / dist;

    // Auseinander schieben
    p1.x -= nx * half;
    p1.y -= ny * half;
    p2.x += nx * half;
    p2.y += ny * half;

    // Elastischer Stoß (stark vereinfacht)
    const tx1 = p1.vx * nx + p1.vy * ny;
    const tx2 = p2.vx * nx + p2.vy * ny;
    const swap = tx1;

    p1.vx += (tx2 - tx1) * nx;
    p1.vy += (tx2 - tx1) * ny;
    p2.vx += (tx1 - tx2) * nx;
    p2.vy += (tx1 - tx2) * ny;
  }
}

module.exports = {
  handlePhysics
};
