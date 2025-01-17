// This is the main game server script that:
// 1. Manages all players and NPCs
// 2. Runs the main game loop (60 times per second)
// 3. Handles scoring and leveling
// 4. Creates and removes players when they join/leave

// Import required game components
const { NPC } = require('./npc');           // NPC (bot) logic
const { Player } = require('./player');      // Player logic
const { handlePhysics } = require('./physics');  // Movement/collision system

// Store all game entities (players and NPCs)
const players = {};

// Main game loop - runs 60 times per second
function startGameLoop() {
    setInterval(() => {
        // Update all movement and collisions
        handlePhysics(players);

        // Update scores and levels for all players
        for (let id in players) {
            const p = players[id];
            if (!p.dead) {
                p.score += 50;           // Add points over time
                if (p.score % 500 === 0) {  // Every 500 points
                    p.level++;              // Level up!
                }
            }
        }
    }, 1000 / 60);  // Run 60 times per second
}

// Create AI-controlled characters (bots)
function spawnNPCs() {
    for (let i = 0; i < 5; i++) {
        const npcId = "NPC_" + i;
        players[npcId] = new NPC(npcId);
    }
}

// Create a new player when someone joins
function spawnPlayer(clientId, name) {
    players[clientId] = new Player(clientId, name);
}

// Remove a player when they leave
function removePlayer(clientId) {
    delete players[clientId];
}

// Get current state of all players/NPCs
function getGameState() {
    return { players };
}

// Make these functions available to other parts of the game
module.exports = {
    startGameLoop,
    spawnNPCs,
    spawnPlayer,
    removePlayer,
    getGameState,
    players
};
