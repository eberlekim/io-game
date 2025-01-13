const Player = require('./player');
const { FIELD_WIDTH, FIELD_HEIGHT } = require('./config');

class Npc extends Player {
  constructor(id) {
    super(id);
    this.isAi = true;
    // Zufällige Start-Position
    this.x = Math.random() * FIELD_WIDTH;
    this.y = Math.random() * FIELD_HEIGHT;
  }

  updateAi() {
    // Minimal-KI: alle ~20 Ticks Richtungsimpuls
    if (Math.random() < 0.05) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = 0.1;
      this.vx += Math.cos(angle) * speed;
      this.vy += Math.sin(angle) * speed;
    }
  }
}

module.exports = Npc;
