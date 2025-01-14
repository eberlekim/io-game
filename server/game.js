const { NPC } = require('./npc');
const { Player } = require('./player');
const { handlePhysics } = require('./physics');

const players = {};

function startGameLoop() {
  setInterval(() => {
    // Physik
    handlePhysics(players);

    // Score & Level
    for (let id in players) {
      const p = players[id];
      if (!p.dead) {
        p.score += 50; // test
        if (p.score % 500 === 0) {
          p.level++;
        }
      }
    }
  }, 1000 / 60); // jetzt 60 FPS
}

// Erstelle ein paar NPC
function spawnNPCs() {
  for (let i = 0; i < 5; i++) {
    const npcId = "NPC_" + i;
    players[npcId] = new NPC(npcId);
  }
}

function spawnPlayer(clientId, name) {
  players[clientId] = new Player(clientId, name);
}

function removePlayer(clientId) {
  delete players[clientId];
}

function getGameState() {
  return { players };
}

module.exports = {
  startGameLoop,
  spawnNPCs,
  spawnPlayer,
  removePlayer,
  getGameState,
  players
};
