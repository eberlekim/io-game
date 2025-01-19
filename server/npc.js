// npc.js
// ---------------------------------------------------------------
// This script creates AI-controlled characters (NPCs) that:
// 1. Move around randomly in the game
// 2. Have basic properties like position and speed
// 3. Can interact with players through collisions
// 4. Update their movement periodically

class NPC {
  constructor(id) {
    // Basic identification
    this.id = id;           // Unique ID for this NPC
    this.name = "NPC";      // Display name
    this.isAi = true;       // Marks this as an AI-controlled character

    // (NEW) Set a classType so we can do multi-shape collision
    // E.g., "NpcClass" -> the server can define how that shape looks
    this.classType = "NpcClass";

    // Position (randomly placed on the map)
    this.x = Math.random() * 600 + 100;    // X position (100-700)
    this.y = Math.random() * 400 + 100;    // Y position (100-500)

    // Movement speed (random initial direction)
    this.vx = (Math.random() - 0.5) * 2;   // X speed (-1 to 1)
    this.vy = (Math.random() - 0.5) * 2;   // Y speed (-1 to 1)

    // Game state
    this.dead = false;      // Whether NPC is alive
    this.score = 0;         // NPC's score (not used)
    this.level = 0;         // NPC's level (not used)
  }

  // AI movement update (called every game tick)
  updateAi() {
    // Simple AI: 1% chance to change direction each update
    if (Math.random() < 0.01) {
      // Add small random changes to speed
      this.vx += (Math.random() - 0.5) * 0.5;  // Change X speed
      this.vy += (Math.random() - 0.5) * 0.5;  // Change Y speed
    }
  }
}

module.exports = { NPC };
