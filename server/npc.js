class NPC {
  constructor(id) {
    this.id = id;
    this.name = "NPC";
    this.isAi = true;
    this.x = Math.random() * 600 + 100;
    this.y = Math.random() * 400 + 100;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.dead = false;
    this.score = 0;
    this.level = 0;
  }

  updateAi() {
    // Einfache KI
    if (Math.random() < 0.01) {
      this.vx += (Math.random() - 0.5) * 0.5;
      this.vy += (Math.random() - 0.5) * 0.5;
    }
  }
}

module.exports = { NPC };
