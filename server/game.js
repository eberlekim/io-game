const Player = require('./player');
const Npc = require('./npc');
const { handlePhysics } = require('./physics');
const {
  FPS,
  SCORE_PER_SECOND,
  MAX_LEVEL,
  FIELD_WIDTH,
  FIELD_HEIGHT
} = require('./config');

const players = {};

function getRequiredScoreForNextLevel(level) {
  const base = 500, factor = 1.3;
  return Math.floor(base * Math.pow(factor, level));
}

function initGame(io) {
  // 10 NPCs auf zufälligen Positionen
  for (let i = 1; i <= 10; i++) {
    spawnNpc("AI_" + i);
  }

  io.on('connection', socket => {
    console.log("New client:", socket.id);

    socket.on('spawnPlayer', () => {
      if (!players[socket.id]) {
        players[socket.id] = new Player(socket.id);
        console.log(`[DEBUG] spawn player ${socket.id}`);
      }
    });

    socket.on('playerName', name => {
      const p = players[socket.id];
      if (p) p.name = name || 'Unknown';
    });

    socket.on('moveKeys', keys => {
      const p = players[socket.id];
      if (p && !p.dead) {
        p.up = keys.up; 
        p.down = keys.down;
        p.left = keys.left;
        p.right = keys.right;
        p.boost = keys.boost;
      }
    });

    socket.on('disconnect', () => {
      console.log("disconnect", socket.id);
      delete players[socket.id];
    });
  });

  setInterval(() => {
    // Score & Level
    for (const id in players) {
      const p = players[id];
      if (!p.dead && !p.isAi) {
        p.score += SCORE_PER_SECOND;
        if (p.level < MAX_LEVEL) {
          const r = getRequiredScoreForNextLevel(p.level);
          if (p.score >= r) {
            p.level++;
            console.log(`Level up: ${id} => ${p.level}`);
          }
        }
      }
    }

    handlePhysics(players);

    // Tote entfernen (Player) bzw. respawnen (NPC)
    for (const id in players) {
      const p = players[id];
      if (p.dead && !p.isAi) {
        console.log(`[DEBUG] removing dead player ${id}`);
        delete players[id];
      } else if (p.dead && p.isAi) {
        console.log(`[DEBUG] NPC dead => respawn`);
        spawnNpc(id);
      }
    }

    io.emit('state', players);
  }, 1000 / FPS);
}

function spawnNpc(nid) {
  const npc = new Npc(nid);
  // Zufällige Position im 500x500-Feld
  npc.x = Math.random() * FIELD_WIDTH;
  npc.y = Math.random() * FIELD_HEIGHT;
  players[nid] = npc;
  console.log(`[DEBUG] spawn NPC ${nid}`);
}

module.exports = initGame;
