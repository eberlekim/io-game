const {
  PLAYER_RADIUS,
  NPC_RADIUS,
  ACCELERATION,
  FRICTION,
  BOOST_STRENGTH,
  BOOST_COOLDOWN,
  FIELD_WIDTH,
  FIELD_HEIGHT
} = require('./config');

function handlePhysics(players) {
  const ids = Object.keys(players);

  for (const id of ids) {
    const p = players[id];
    if (p.dead) continue;

    // KI vs. Spieler-Steuerung
    if (p.isAi) {
      if (p.updateAi) p.updateAi();
    } else {
      if (p.up)    p.vy -= ACCELERATION;
      if (p.down)  p.vy += ACCELERATION;
      if (p.left)  p.vx -= ACCELERATION;
      if (p.right) p.vx += ACCELERATION;

      const now = Date.now();
      if (p.boost) {
        if (now - p.lastBoostTime >= BOOST_COOLDOWN) {
          p.vx *= BOOST_STRENGTH;
          p.vy *= BOOST_STRENGTH;
          p.lastBoostTime = now;
        }
        p.boost = false;
      }
    }

    // Reibung & Bewegung
    p.vx *= FRICTION;
    p.vy *= FRICTION;
    p.x += p.vx;
    p.y += p.vy;

    // Bounds => tot
    if (p.x < 0 || p.x > FIELD_WIDTH || p.y < 0 || p.y > FIELD_HEIGHT) {
      p.dead = true;
    }
  }

  // Kollisionen zwischen allen
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const p1 = players[ids[i]];
      const p2 = players[ids[j]];
      if (!p1.dead && !p2.dead) {
        resolveCollision(p1, p2);
      }
    }
  }
}

function resolveCollision(p1, p2) {
  // Unterschiedliche Radien für Spieler und NPC
  const r1 = p1.isAi ? NPC_RADIUS : PLAYER_RADIUS;
  const r2 = p2.isAi ? NPC_RADIUS : PLAYER_RADIUS;

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = r1 + r2;

  if (dist < minDist) {
    const overlap = minDist - dist;
    const half = overlap / 2;
    const nx = dx / dist;
    const ny = dy / dist;

    // Auseinander schieben
    p1.x -= nx * half;
    p1.y -= ny * half;
    p2.x += nx * half;
    p2.y += ny * half;

    // Impulsberechnung
    const tx1 = p1.vx * nx + p1.vy * ny;
    const tx2 = p2.vx * nx + p2.vy * ny;

    // NPC etwas "leichter", Player "schwerer"
    const f1 = p1.isAi ? 0.5 : 2.0;
    const f2 = p2.isAi ? 0.5 : 2.0;

    p1.vx += (tx2 - tx1) * nx * f1;
    p1.vy += (tx2 - tx1) * ny * f1;
    p2.vx += (tx1 - tx2) * nx * f2;
    p2.vy += (tx1 - tx2) * ny * f2;
  }
}

module.exports = { handlePhysics };