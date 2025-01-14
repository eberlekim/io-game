const { Player } = require("./player");
const { Npc } = require("./npc");
const { updatePhysics } = require("./physics");

const players = {};
const NPCs = {}; // optional

function startGameLoop(wss) {
  setInterval(() => {
    // Update
    Object.values(players).forEach((pl) => {
      if (!pl.dead) {
        updatePhysics(pl);
        pl.score += 50; // Dummy
      }
    });
    // Optional: NPCs updaten ...

    broadcastState(wss);
  }, 100);
}

function spawnPlayer(clientId, name = "Unbekannt") {
  if (!players[clientId]) {
    players[clientId] = new Player(clientId, name);
    console.log("[DEBUG] spawn player", clientId);
  }
}

function getState() {
  const state = { players: {} };
  Object.entries(players).forEach(([id, pl]) => {
    state.players[id] = {
      id: pl.id,
      x: pl.x,
      y: pl.y,
      vx: pl.vx,
      vy: pl.vy,
      dead: pl.dead,
      isAi: pl.isAi,
      name: pl.name,
      score: pl.score,
      level: pl.level
    };
  });
  return state;
}

function broadcastState(wss) {
  const state = getState();
  const data = JSON.stringify({ type: "state", players: state.players });

  let count = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      count++;
      client.send(data);
    }
  });
  // console.log(`broadcastState: sending to ${count} WS clients...`);
}

module.exports = {
  players,
  startGameLoop,
  getState,
  spawnPlayer
};
