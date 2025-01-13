const Player = require('./player');

class Npc extends Player {
  constructor(id) {
    super(id);
    this.isAi = true;
    // Position wird zufällig gesetzt (s. spawnNpc in game.js).
  }

  updateAi() {
    // Mini-KI: alle paar Ticks Richtung ändern
    if (Math.random() < 0.05) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = 0.1;
      this.vx += Math.cos(angle) * speed;
      this.vy += Math.sin(angle) * speed;
    }
  }
}

module.exports = Npc;
