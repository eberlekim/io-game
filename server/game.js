const Player = require('./player');
const Npc = require('./npc');
const { handlePhysics } = require('./physics');
const {
  FPS,
  SCORE_PER_SECOND,
  MAX_LEVEL
} = require('./config');

const players = {};

function getRequiredScoreForNextLevel(level) {
  const base = 500;
  const factor = 1.3;
  return Math.floor(base * Math.pow(factor, level));
}

function initGame(wss) {
  // Beispiel: 5 NPCs
  for (let i = 1; i <= 5; i++) {
    spawnNpc("AI_" + i);
  }

  wss.on('connection', (ws) => {
    console.log("New client connected");

    // 1) ID erzeugen
    const clientId = generateId();
    ws.clientId = clientId;

    // 2) Client seine ID mitteilen
    ws.send(JSON.stringify({
      type: 'yourId',
      id: clientId
    }));

    // Daten empfangen
    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch (e) {
        console.log("Invalid JSON:", raw);
        return;
      }
      handleClientMessage(ws, msg);
    });

    // Verbindung abgebrochen
    ws.on('close', () => {
      console.log("disconnect", ws.clientId);
      if (players[ws.clientId]) {
        delete players[ws.clientId];
      }
    });
  });

  // Game-Loop
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

    // Tote entfernen bzw. NPC respawnen
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

    // State an alle Clients
    broadcastState(wss);
  }, 1000 / FPS);
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function handleClientMessage(ws, msg) {
  switch (msg.type) {
    case 'spawnPlayer':
      if (!players[ws.clientId]) {
        players[ws.clientId] = new Player(ws.clientId);
        console.log(`[DEBUG] spawn player ${ws.clientId}`);
      }
      break;

    case 'playerName':
      if (players[ws.clientId]) {
        players[ws.clientId].name = msg.name || 'Unknown';
      }
      break;

    case 'moveKeys':
      const p = players[ws.clientId];
      if (p && !p.dead) {
        p.up = msg.up;
        p.down = msg.down;
        p.left = msg.left;
        p.right = msg.right;
        p.boost = msg.boost;
      }
      break;

    default:
      console.log("Unknown msg.type:", msg.type);
  }
}

function broadcastState(wss) {
  const snapshot = {};
  for (const id in players) {
    const p = players[id];
    snapshot[id] = {
      x: p.x, y: p.y,
      vx: p.vx, vy: p.vy,
      dead: p.dead,
      isAi: p.isAi,
      name: p.name,
      score: p.score,
      level: p.level
    };
  }
  const msg = JSON.stringify({
    type: 'state',
    players: snapshot
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}

function spawnNpc(nid) {
  const npc = new Npc(nid);
  players[nid] = npc;
  console.log(`[DEBUG] spawn NPC ${nid}`);
}

module.exports = initGame;
