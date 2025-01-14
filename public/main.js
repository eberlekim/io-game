console.log("[CLIENT] main.js loaded!");

const startScreen = document.getElementById("startScreen");
const gameCanvas  = document.getElementById("gameCanvas");
const deathScreen = document.getElementById("deathScreen");
const deathReason = document.getElementById("deathReason");

const startGameBtn = document.getElementById("startGameBtn");
const respawnBtn   = document.getElementById("respawnBtn");
const ctx          = gameCanvas.getContext("2d");

let ws;
let myId = null;
let players = {}; // State from server

// UI setup
startGameBtn.addEventListener("click", () => {
  console.log("[CLIENT] Hiding startScreen, showing canvas");
  startScreen.style.display = "none";
  gameCanvas.style.display  = "block";
  connectWs();
});

respawnBtn.addEventListener("click", () => {
  console.log("[CLIENT] Respawn clicked - just reload for now or handle differently");
  window.location.reload();
});

// WebSocket connect
function connectWs() {
  // Bei Render => wss://(deineApp).onrender.com
  // Sonst => wss://window.location.host
  const wsUrl = `wss://${window.location.host}`;
  console.log("[CLIENT] connectWs ->", wsUrl);

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("[CLIENT] WS connected -> sending spawnPlayer & playerName");
    // Sende an Server, damit wir ggf. respawnen
    ws.send(JSON.stringify({ type: "spawnPlayer", name: "NoName" }));
  };

  ws.onmessage = (message) => {
    const msg = JSON.parse(message.data);
    console.log("[CLIENT] WS onmessage RAW =>", msg);

    if (msg.type === "yourId") {
      myId = msg.id;
      console.log("Got myId:", myId);
      return;
    }

    if (msg.type === "state") {
      players = msg.players;

      // Falls wir selber noch nicht angelegt sind, ignorieren wir diesen State
      if (!myId || !players[myId]) {
        console.log("[CLIENT] No 'me' in players => ignoring state temporarily");
        return; 
      }

      // Prüfen, ob wir tot sind
      if (players[myId].dead) {
        console.log("[CLIENT] me.dead === true => showDeathScreen");
        showDeathScreen("Server says I'm dead");
        return;
      }

      // Alles okay, also updaten wir das Canvas
      renderGame(players);
    }
  };

  ws.onclose = () => {
    console.log("[CLIENT] WS onclose");
    // Wir könnten hier showDeathScreen("WebSocket closed"); aufrufen, etc.
    showDeathScreen("WebSocket closed or lost");
  };

  ws.onerror = (err) => {
    console.error("[CLIENT] WS error", err);
  };
}

function showDeathScreen(reason) {
  console.log("[CLIENT] showDeathScreen called. reason =", reason);
  deathReason.textContent = reason;
  deathScreen.style.display = "flex";
  gameCanvas.style.display  = "none";
}

function renderGame(players) {
  // Clear Canvas
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Draw each player
  Object.entries(players).forEach(([id, pl]) => {
    if (pl.dead) return;

    // Einfacher Kreis
    ctx.beginPath();
    ctx.arc(pl.x, pl.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = pl.isAi ? "orange" : "cyan";
    if (id === myId) ctx.fillStyle = "lime";
    ctx.fill();
  });
}
