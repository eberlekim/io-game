console.log("[CLIENT] main.js loaded!");

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

let ws;
let myId = null;
let players = {};

// Wir verwenden als Name "unbenannt"
const playerName = "unbenannt";

// Verbinde
function connectWs() {
  let wsUrl;
  if (window.location.hostname === "localhost") {
    wsUrl = "ws://localhost:3001";
  } else {
    wsUrl = window.location.origin.replace(/^http/, "ws");
  }
  console.log("[CLIENT] connectWs ->", wsUrl);

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("[CLIENT] WS connected, sending spawnPlayer");
    ws.send(JSON.stringify({ type: "spawnPlayer", name: playerName }));
  };

  ws.onmessage = (evt) => {
    let data = JSON.parse(evt.data);

    if (data.type === "yourId") {
      myId = data.id;
      console.log("Got myId:", myId);
    } 
    else if (data.type === "state") {
      players = data.players;
      renderGame();
    }
  };

  ws.onclose = () => {
    console.log("[CLIENT] WS onclose");
  };
}

function renderGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let id in players) {
    const p = players[id];
    if (p.dead) continue;

    // Kreise
    ctx.beginPath();
    if (p.isAi) {
      ctx.fillStyle = "orange";
      ctx.arc(p.x, p.y, 15, 0, 2 * Math.PI);
    } else {
      ctx.fillStyle = (id === myId) ? "lime" : "cyan";
      ctx.arc(p.x, p.y, 15, 0, 2 * Math.PI);
    }
    ctx.fill();

    // Name / Score
    ctx.fillStyle = "#fff";
    ctx.font = "12px sans-serif";
    ctx.fillText(p.name + " (lvl " + p.level + ")", p.x + 20, p.y);
  }
}

// Sende Input
function sendInput(data) {
  if (!ws) return;
  ws.send(JSON.stringify({ type: "input", ...data }));
}

// Key-Events
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

// Starte
connectWs();
