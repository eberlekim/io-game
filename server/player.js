// player.js

class Player {
  constructor(id, name) {
    // Available class types
    this.availableClasses = ["BoosterClass", "BaseClass"];
    this.currentClassIndex = 0;
    this.classType = this.availableClasses[this.currentClassIndex]; // Set initial class from array
    
    this.id = id;
    this.name = name || "unbenannt";
    this.isAi = false;
    

    this.x = 400;
    this.y = 300;
    this.vx = 0;
    this.vy = 0;

    this.radius = 15; // optional, if you want to keep old references

    this.dead = false;
    this.score = 0;
    this.level = 0;

    // Movement keys
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
  }

  switchClass() {
    this.currentClassIndex = (this.currentClassIndex + 1) % this.availableClasses.length;
    this.classType = this.availableClasses[this.currentClassIndex];
  }
}

module.exports = { Player };
