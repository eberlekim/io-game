const { FIELD_WIDTH, FIELD_HEIGHT } = require('./config');

class Player {
  constructor(id) {
    this.id = id;
    this.x = FIELD_WIDTH / 2;
    this.y = FIELD_HEIGHT / 2;
    this.vx = 0;
    this.vy = 0;

    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.boost = false;
    this.lastBoostTime = 0;

    this.isAi = false;
    this.name = 'Unbekannt';
    this.score = 0;
    this.level = 0;
    this.dead = false;
  }
}

module.exports = Player;
