class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name || "NoName";
    this.x = 250;
    this.y = 250;
    this.vx = 0;
    this.vy = 0;
    this.dead = false;
    this.isAi = false;
    this.score = 0;
    this.level = 0;
  }
}

module.exports = { Player };
