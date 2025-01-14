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
  const base = 500, factor = 1.3;
  return Math.floor(base * Math.pow(factor, level));
}

function initGame(wss) {
  // Beispiel: 5 NPCs
  for (let i = 1; i <= 5; i++) {
    spawnNpc("AI_" + i);
  }

  wss.on('connection', (ws) => {
    console.log("New client connected (raw ws).");

    // Eindeutige ID
    const clientId = generateId();
    ws.clientId = clientId;
    console.log("Assigned clientId =", clientId);

    // Schicke dem Client seine ID
    ws.send(JSON.stringify({
      type: 'yourId',
      id: clientId
    }));

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch (e) {
        console.log("Invalid JSON from client:", raw);
        return;
      }
      handleClientMessage(ws, msg);
    });

    ws.on('close', (code, reason) => {
      console.log(`WS closed: clientId=${clientId}, code=${code}, reason=${reason}`);
      if (players[clientId]) {
        delete players[clientId];
      }
    });
  });

  // Haupt-Game-Loop
  setInterval(() => {
    // Score & Levelups
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

    // Physik (Bewegung, Kollisionen)
    handlePhysics(players);

    // Tote entfernen (außer NPC) bzw. respawnen (NPC)
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

    // Broadcast state
    broadcastState(wss);
  }, 1000 / FPS);
}

function handleClientMessage(ws, msg) {
  const clientId = ws.clientId;

  switch (msg.type) {
    case 'spawnPlayer':
      if (!players[clientId]) {
        players[clientId] = new Player(clientId);
        console.log(`[DEBUG] spawn player ${clientId}`);
      }
      break;

    case 'playerName':
      if (players[clientId]) {
        players[clientId].name = msg.name || 'Unknown';
      }
      break;

    case 'moveKeys': {
      const p = players[clientId];
      if (p && !p.dead) {
        p.up = msg.up;
        p.down = msg.down;
        p.left = msg.left;
        p.right = msg.right;
        p.boost = msg.boost;
      }
      break;
    }

    default:
      console.log("Unknown message type:", msg.type);
  }
}

function broadcastState(wss) {
  const snapshot = {};
  for (const id in players) {
    const p = players[id];
    snapshot[id] = {
      x: p.x,
      y: p.y,
      vx: p.vx,
      vy: p.vy,
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

  // Debug
  console.log(`broadcastState: sending to ${wss.clients.size} WS clients...`);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      console.log(" -> sending state to", client.clientId);
      client.send(msg);
    }
  });
}

function spawnNpc(nid) {
  const npc = new Npc(nid);
  players[nid] = npc;
  console.log(`[DEBUG] spawn NPC ${nid}`);
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

module.exports = initGame;
