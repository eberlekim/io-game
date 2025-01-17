// This is the game's physics engine that:
// 1. Handles all player and NPC movement
// 2. Processes collisions between entities
// 3. Applies friction and boundaries
// 4. Makes NPCs bounce differently than players

// Import important numbers that control how the game feels
const {
    PLAYER_RADIUS,     // How big players are
    NPC_RADIUS,        // How big NPCs are
    ACCELERATION,      // How fast things speed up
    FRICTION,          // How fast things slow down
    BOOST_STRENGTH,    // Not used yet
    BOOST_COOLDOWN,    // Not used yet
    FIELD_WIDTH,       // How wide the game field is
    FIELD_HEIGHT       // How tall the game field is
} = require('./config');

// PART 1: Main function that updates everything in the game
function handlePhysics(players) {
    const ids = Object.keys(players);

    // MOVEMENT: Update positions for all players and NPCs
    for (let id of ids) {
        const p = players[id];
        if (p.dead) continue;  // Skip dead players

        // NPCs move using AI, players move using keyboard
        if (p.isAi && typeof p.updateAi === "function") {
            p.updateAi();
        } else {
            // WASD keys change velocity (speed and direction)
            if (p.up)    p.vy -= ACCELERATION;  
            if (p.down)  p.vy += ACCELERATION;  
            if (p.left)  p.vx -= ACCELERATION;  
            if (p.right) p.vx += ACCELERATION;  
        }

        // Everything slows down over time and moves
        p.vx *= FRICTION;  // Slow down left/right
        p.vy *= FRICTION;  // Slow down up/down
        p.x += p.vx;       // Move left/right
        p.y += p.vy;       // Move up/down

        // Kill anything that leaves the game area
        if (p.x < 0 || p.x > FIELD_WIDTH || p.y < 0 || p.y > FIELD_HEIGHT) {
            p.dead = true;
            console.log(`Player ${p.id} dead`);
        }
    }

    // PART 2: Check if anything hits anything else
    for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
            const p1 = players[ids[i]];
            const p2 = players[ids[j]];
            if (!p1.dead && !p2.dead) {
                resolveCollision(p1, p2);
            }
        }
    }
}

// PART 3: Handle what happens when two things hit each other
function resolveCollision(p1, p2) {
    // Figure out how big each thing is
    const r1 = p1.isAi ? NPC_RADIUS : PLAYER_RADIUS;
    const r2 = p2.isAi ? NPC_RADIUS : PLAYER_RADIUS;

    // Check if they're touching
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = r1 + r2;

    // If they're touching, make them bounce
    if (dist < minDist) {
        // Push them apart
        const overlap = minDist - dist;
        const half = overlap / 2;
        const nx = dx / dist;  // Direction to push
        const ny = dy / dist;  // Direction to push

        p1.x -= nx * half;  // Push first thing left/right
        p1.y -= ny * half;  // Push first thing up/down
        p2.x += nx * half;  // Push second thing left/right
        p2.y += ny * half;  // Push second thing up/down

        // Calculate the bounce effect
        const tx1 = p1.vx * nx + p1.vy * ny;
        const tx2 = p2.vx * nx + p2.vy * ny;

        // NPCs bounce less than players
        const f1 = p1.isAi ? 0.3 : 3.0;  // Small bounce for NPCs
        const f2 = p2.isAi ? 0.3 : 3.0;  // Big bounce for players

        // Apply the bounce
        p1.vx += (tx2 - tx1) * nx * f1;
        p1.vy += (tx2 - tx1) * ny * f1;
        p2.vx += (tx1 - tx2) * nx * f2;
        p2.vy += (tx1 - tx2) * ny * f2;
    }
}

// Make this available to other parts of the game
module.exports = { handlePhysics };
