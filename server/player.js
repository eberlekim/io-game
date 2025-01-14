class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name || "unbenannt";
    this.isAi = false;
    this.x = 400; 
    this.y = 300;
    this.vx = 0;
    this.vy = 0;
    this.dead = false;
    this.score = 0;
    this.level = 0;

    // Inputs (falls gewünscht)
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.boost = false;
    this.lastBoostTime = 0;
  }
}

module.exports = { Player };
