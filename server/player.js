/***********************************************************
 * server/player.js
 *   - Repräsentiert einen Spieler im Spiel
 *   - Name, Position, Geschwindigkeit, etc.
 ************************************************************/
const {
  FIELD_WIDTH, FIELD_HEIGHT
} = require('./config');

class Player {
  constructor(id) {
    this.id = id;
    // Zufällige Start-Position
    this.x = Math.random() * FIELD_WIDTH - FIELD_WIDTH / 2;
    this.y = Math.random() * FIELD_HEIGHT - FIELD_HEIGHT / 2;
    this.vx = 0;
    this.vy = 0;

    // Tasten-Zustände
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.boost = false;

    // Boost
    this.lastBoostTime = 0;

    // Später kannst du hier Name, Score, Upgrades etc. ergänzen
    this.name = 'Unbekannt'; 
    this.score = 0;
  }
}

module.exports = Player;
