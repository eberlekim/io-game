// main.js
// ---------------------------------------------------------------
// This is a multiplayer game client script that:
// 1. Connects to a game server via WebSocket
// 2. Handles player movement using WASD keys
// 3. Renders all players and NPCs on the game map
// 4. Keeps the current player centered on screen
//
// Modified to:
//  - Use a "renderer" object for each non-AI player
//  - Keep the old circle rendering for NPCs (isAi: true)
//  - Add "classType" logic for choosing BaseClassRender
//  - Place the name above the shape

console.log("[CLIENT] main.js loaded!");

const gameContainer = document.getElementById("gameContainer");
const mapEl = document.getElementById("map");

// Set up the game area size - must match server settings
const FIELD_WIDTH = 1000;
const FIELD_HEIGHT = 1000;

// Store important game state
let ws;                    // WebSocket connection
let myId = null;          // ID of current player
let players = {};         // All players/NPCs in the game

// NEW: We'll store references to each player's renderer here
// Key: playerId, Value: instance of BaseClassRender (etc.)
const renderers = {};

// A default name for this player (we might replace with input box later)
const playerName = "unbenannt";

// Function to establish WebSocket connection to game server
function connectWs() {
  let wsUrl;
  if (window.location.hostname === "localhost") {
    wsUrl = "ws://localhost:3001";
  } else {
    wsUrl = window.location.origin.replace(/^http/, "ws");
  }

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("[CLIENT] WS connected, spawnPlayer...");
    ws.send(JSON.stringify({ type: "spawnPlayer", name: playerName }));
  };

  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);

    if (data.type === "yourId") {
      myId = data.id;
      console.log("Got myId:", myId);
    } else if (data.type === "state") {
      players = data.players;  // The entire game state of players
      renderGame();
    }
  };

  ws.onclose = () => {
    console.log("[CLIENT] WS closed.");
  };
}

// Function to update the game display
function renderGame() {
  if (!myId || !players[myId]) return;
  const me = players[myId];

  // We'll create/update HTML elements for each player and NPC
  for (const id in players) {
    const p = players[id];
    if (p.dead) continue;  // Skip dead players

    if (p.isAi) {
      // NPC RENDERING
      // Check if NPC already has a div
      let npcDiv = document.querySelector(`[data-npc-id="${id}"]`);
      if (!npcDiv) {
        npcDiv = document.createElement("div");
        npcDiv.classList.add("entity", "npc");
        npcDiv.setAttribute("data-npc-id", id);
        mapEl.appendChild(npcDiv);
      }
      // Update NPC position and text
      npcDiv.style.left = (p.x - 15) + "px";
      npcDiv.style.top = (p.y - 15) + "px";
      npcDiv.textContent = p.name + " (" + p.level + ")";

    } else {
      // PLAYER RENDERING
      if (!renderers[id]) {
        if (p.classType === "BaseClass") {
          renderers[id] = new BaseClassRender(p);
          mapEl.appendChild(renderers[id].rootEl);
        }
      }
      renderers[id].update(p);
    }
  }

  // Clean up any renderers and NPC elements for entities that are gone or dead
  // First, clean up player renderers
  for (const id in renderers) {
    if (!players[id] || players[id].dead) {
      renderers[id].remove();
      delete renderers[id];
      console.log(`Renderer for player ${id} removed`);
    }
  }

  // Then, clean up NPC elements
  const npcElements = document.querySelectorAll('[data-npc-id]');
  npcElements.forEach(el => {
    const npcId = el.getAttribute('data-npc-id');
    if (!players[npcId] || players[npcId].dead) {
      el.remove();
    }
  });

  // Center the camera on the current player
  const viewportW = gameContainer.clientWidth;
  const viewportH = gameContainer.clientHeight;
  const offsetX = (viewportW / 2) - me.x;
  const offsetY = (viewportH / 2) - me.y;
  mapEl.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

// Handle keyboard input (WASD keys)
document.addEventListener("keydown", (e) => {
  if (e.key === "w") sendInput({ up: true });
  if (e.key === "a") sendInput({ left: true });
  if (e.key === "s") sendInput({ down: true });
  if (e.key === "d") sendInput({ right: true });
});
document.addEventListener("keyup", (e) => {
  if (e.key === "w") sendInput({ up: false });
  if (e.key === "a") sendInput({ left: false });
  if (e.key === "s") sendInput({ down: false });
  if (e.key === "d") sendInput({ right: false });
});

// Send player movement to server
function sendInput(data) {
  if (!ws) return;
  ws.send(JSON.stringify({ type: "input", ...data }));
}

// Start the game by connecting to server
connectWs();
