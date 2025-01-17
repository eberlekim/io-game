// player.js
// ---------------------------------------------------
// This script creates player characters that:
// 1. Have basic properties like position and speed
// 2. Can be controlled by real players using WASD keys
// 3. Keep track of their score and level
// 4. Can move around and interact with other players
// 
// Modified to include:
//  - this.classType ("BaseClass" by default)
//  - this.radius (15) to match our circle collision
//  - Additional comments

class Player {
  constructor(id, name) {
    // Basic identification
    this.id = id;                         // Unique ID for this player
    this.name = name || "unbenannt";      // Player name
    this.isAi = false;                    // This is a real player, not an AI

    // NEW: The "classType" indicates which shape or class we use.
    // For now, let's default everyone to "BaseClass."
    this.classType = "BaseClass";

    // Starting position (middle of screen)
    this.x = 400;
    this.y = 300;

    // Movement
    this.vx = 0; // Speed left/right
    this.vy = 0; // Speed up/down

    // NEW: A radius used by our current circle-based collision system
    // This might align with the "body.radius" in BaseClass.js
    this.radius = 15;

    // Game state
    this.dead = false;
    this.score = 0;
    this.level = 0;

    // Movement controls (WASD keys)
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;

    // Future features (not used yet)
    this.boost = false;
    this.lastBoostTime = 0;

    this.classType = "BaseClass";

  }
}

module.exports = { Player };
