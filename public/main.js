console.log("[CLIENT] main.js loaded!");

const gameContainer = document.getElementById("gameContainer");
const mapEl = document.getElementById("map");

// Spielfeld-Größe (muss SERVER-seitig übereinstimmen!)
const FIELD_WIDTH = 1000;
const FIELD_HEIGHT = 1000;

let ws;
let myId = null;
let players = {};

const playerName = "unbenannt";

// Verbindung
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

// Rendering
function renderGame() {
  if (!myId || !players[myId]) return;
  const me = players[myId];

  // HTML-Struktur neu erzeugen
  mapEl.innerHTML = "";

  // Entitäten (Player/NPC)
  for (const id in players) {
    const p = players[id];
    if (p.dead) continue;

    const div = document.createElement("div");
    div.classList.add("entity");
    if (p.isAi) {
      div.classList.add("npc");
    } else {
      div.classList.add("player");
      if (id === myId) div.classList.add("me");
    }

    div.style.left = (p.x - 15) + "px";
    div.style.top  = (p.y - 15) + "px";
    div.textContent = p.name + " (" + p.level + ")";

    mapEl.appendChild(div);
  }

  // Kamera: Spieler in Fenstermitte
  const viewportW = gameContainer.clientWidth;
  const viewportH = gameContainer.clientHeight;

  const offsetX = (viewportW / 2) - me.x;
  const offsetY = (viewportH / 2) - me.y;

  // Keine Clamping: sieht man eben "außerhalb"
  mapEl.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

// Eingaben
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

function sendInput(data) {
  if (!ws) return;
  ws.send(JSON.stringify({ type: "input", ...data }));
}

// Los geht's
connectWs();
