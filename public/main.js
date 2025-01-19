// main.js
// ---------------------------------------------------------------
// This is a multiplayer game client script that:
// 1. Connects to a game server via WebSocket
// 2. Handles player movement using WASD keys
// 3. Renders all players and NPCs on the game map
// 4. Keeps the current player centered on screen
// 5. (NEW) Optional debug mode for drawing hitboxes in color

console.log("[CLIENT] main.js loaded!");

const gameContainer = document.getElementById("gameContainer");
const mapEl = document.getElementById("map");

const FIELD_WIDTH = 1000;
const FIELD_HEIGHT = 1000;

let ws;
let myId = null;
let players = {};

// Renders for each player
const renderers = {};

const playerName = "unbenannt";

// NEW: Debug mode toggle
let debugMode = false;

// NEW: Add zoom control
let zoomLevel = 1.0;  // Default zoom level
const ZOOM_STEP = 0.1;  // How much to zoom per key press
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

// Set up a key (e.g. 'h') to toggle debug hitboxes
document.addEventListener("keydown", (e) => {
  if (e.key === "h") {
    debugMode = !debugMode;
    console.log("Debug mode:", debugMode);
    // Force re-render if needed
    renderGame();
  }

  // NEW: Zoom controls
  if (e.key === "+") {
    zoomLevel = Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP);
    renderGame();
  }
  if (e.key === "-") {
    zoomLevel = Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP);
    renderGame();
  }

  // Class switching
  if (e.key === "p") {
    sendInput({ switchClass: true });
  }

  // Movement
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

// Connect
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
      players = data.players;
      renderGame();
    }
  };

  ws.onclose = () => {
    console.log("[CLIENT] WS closed.");
  };
}

function renderGame() {
  if (!myId || !players[myId]) return;
  const me = players[myId];

  // For each entity
  for (const id in players) {
    const p = players[id];
    if (p.dead) continue;

    if (p.isAi) {
      // NPC logic as before
      let npcDiv = document.querySelector(`[data-npc-id="${id}"]`);
      if (!npcDiv) {
        npcDiv = document.createElement("div");
        npcDiv.classList.add("entity", "npc");
        npcDiv.setAttribute("data-npc-id", id);
        mapEl.appendChild(npcDiv);
      }
      npcDiv.style.left = (p.x - 15) + "px";
      npcDiv.style.top = (p.y - 15) + "px";
      npcDiv.textContent = p.name + " (" + p.level + ")";

    } else {
      // PLAYER
      if (!renderers[id] || renderers[id].constructor.name !== `${p.classType}Render`) {
        // Remove old renderer if exists
        if (renderers[id]) {
          renderers[id].remove();
          delete renderers[id];
        }
        // Create new renderer
        if (p.classType === "BaseClass") {
          renderers[id] = new BaseClassRender(p);
          mapEl.appendChild(renderers[id].rootEl);
        }
        if (p.classType === "BoosterClass") {
          renderers[id] = new BoosterClassRender(p);
          mapEl.appendChild(renderers[id].rootEl);
        }
      }
      renderers[id].update(p, debugMode);
    }
  }

  // Cleanup
  for (const id in renderers) {
    if (!players[id] || players[id].dead) {
      renderers[id].remove();
      delete renderers[id];
    }
  }
  const npcEls = document.querySelectorAll('[data-npc-id]');
  npcEls.forEach(el => {
    const npcId = el.getAttribute('data-npc-id');
    if (!players[npcId] || players[npcId].dead) {
      el.remove();
    }
  });

  // Camera transform
  const viewportW = gameContainer.clientWidth;
  const viewportH = gameContainer.clientHeight;
  
  const cx = viewportW / 2;
  const cy = viewportH / 2;

  mapEl.style.transformOrigin = "0 0";
  mapEl.style.transform = `
    translate(${cx}px, ${cy}px)
    scale(${zoomLevel})
    translate(${-me.x}px, ${-me.y}px)
  `;
}

function sendInput(data) {
  if (!ws) return;
  ws.send(JSON.stringify({ type: "input", ...data }));
}

connectWs();
