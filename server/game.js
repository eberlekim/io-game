const { Player } = require("./player.js");
const { updatePhysics } = require("./physics.js"); // EXACT path with .js
// ^ Das war vermutlich das Problem: die falsche Pfadangabe?

const players = {};

function startGameLoop(wss) {
  setInterval(() => {
    Object.values(players).forEach((pl) => {
      if (!pl.dead) {
        // Hier "updatePhysics" aufrufen
        updatePhysics(pl);

        // Ggf. Score hochzählen
        pl.score += 50;
        pl.level = Math.floor(pl.score / 500);
      }
    });
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
  // Optional debug:
  // console.log("broadcastState: sending to", count, "WS clients...");
}

module.exports = {
  players,
  spawnPlayer,
  startGameLoop
};
