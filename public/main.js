console.log("[CLIENT] main.js loaded!");

const startScreen = document.getElementById('startScreen');
const nameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const deathScreen = document.getElementById('deathScreen');
const deathScore = document.getElementById('deathScore');
const retryBtn = document.getElementById('retryBtn');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas soll das ganze Browserfenster ausfüllen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ws = null;   // WebSocket
let myId = null; // Eigene Player-ID, vom Server zugewiesen
let players = {}; 
let isAlive = false;

// Start-Button
startBtn.addEventListener('click', () => {
  const name = nameInput.value.trim() || 'NoName';
  connectWs(name);

  startScreen.style.display = 'none';
  canvas.style.display = 'block';
  deathScreen.style.display = 'none';
  isAlive = true;
});

// Retry-Button
retryBtn.addEventListener('click', () => {
  location.reload();
});

// Eingaben
let inputKeys = { up: false, down: false, left: false, right: false, boost: false };

window.addEventListener('keydown', e => {
  switch(e.key) {
    case 'w':
    case 'ArrowUp':    inputKeys.up = true; break;
    case 's':
    case 'ArrowDown':  inputKeys.down = true; break;
    case 'a':
    case 'ArrowLeft':  inputKeys.left = true; break;
    case 'd':
    case 'ArrowRight': inputKeys.right = true; break;
    case ' ':          inputKeys.boost = true; break;
  }
  sendMoveKeys();
});
window.addEventListener('keyup', e => {
  switch(e.key) {
    case 'w':
    case 'ArrowUp':    inputKeys.up = false; break;
    case 's':
    case 'ArrowDown':  inputKeys.down = false; break;
    case 'a':
    case 'ArrowLeft':  inputKeys.left = false; break;
    case 'd':
    case 'ArrowRight': inputKeys.right = false; break;
    case ' ':          inputKeys.boost = false; break;
  }
  sendMoveKeys();
});

/**
 * Stellt eine WebSocket-Verbindung zum Server her.
 * Nutzt automatisch "wss://" wenn die Seite per HTTPS erreichbar ist,
 * und "ws://" bei HTTP. So vermeidet man Mixed-Content-Fehler.
 */
function connectWs(playerName) {
  const protocol = (location.protocol === 'https:') ? 'wss:' : 'ws:';
  const port = location.port ? (':' + location.port) : ''; 
  const host = location.hostname;  

  // Bsp: wss://mein-spiel.onrender.com  oder ws://localhost:3001
  ws = new WebSocket(`${protocol}//${host}${port}`);

  ws.onopen = () => {
    console.log("WS connected");
    // Sobald offen, teilen wir dem Server mit, dass wir spawnen wollen
    ws.send(JSON.stringify({ type: 'spawnPlayer' }));
    // ... und unseren Namen
    ws.send(JSON.stringify({ type: 'playerName', name: playerName }));
  };

  ws.onmessage = (evt) => {
    let msg;
    try {
      msg = JSON.parse(evt.data);
    } catch (e) {
      console.error("Invalid JSON from server:", evt.data);
      return;
    }

    // Wir unterscheiden anhand von msg.type
    if (msg.type === 'yourId') {
      // Server teilt uns unsere Player-ID mit
      myId = msg.id;
      console.log("Got myId:", myId);

    } else if (msg.type === 'state') {
      // Kompletter Spielzustand
      players = msg.players;
      if (myId) {
        const me = players[myId];
        if (!me || me.dead) {
          if (isAlive) showDeathScreen();
          isAlive = false;
        }
      }

    } else {
      console.log("Unknown message type:", msg.type);
    }
  };

  ws.onclose = () => {
    console.log("WS disconnected");
    if (isAlive) showDeathScreen();
  };
}

/** Sendet unsere Eingaben an den Server */
function sendMoveKeys() {
  if (!ws) return;
  ws.send(JSON.stringify({
    type: 'moveKeys',
    up: inputKeys.up,
    down: inputKeys.down,
    left: inputKeys.left,
    right: inputKeys.right,
    boost: inputKeys.boost
  }));
}

/** Zeigt den Deathscreen, blendet Canvas aus */
function showDeathScreen() {
  if (players[myId]) {
    deathScore.textContent = players[myId].score || 0;
  }
  deathScreen.style.display = 'block';
  canvas.style.display = 'none';
}

/** Haupt-Render-Loop */
function gameLoop() {
  requestAnimationFrame(gameLoop);
  if (!isAlive) return;
  if (!myId) return; // Warten bis wir unsere ID haben

  const me = players[myId];
  if (!me) return;   // Falls noch kein Eintrag existiert

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Kamera-Offset => Player in Bildschirmmitte
  const offsetX = canvas.width / 2 - me.x;
  const offsetY = canvas.height / 2 - me.y;

  // Weißes Spielfeld
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.fillRect(offsetX, offsetY, 500, 500);

  // Alle Spieler
  for (const id in players) {
    const p = players[id];
    if (p.dead) continue;

    const drawX = p.x + offsetX;
    const drawY = p.y + offsetY;

    if (p.isAi) {
      // NPC = blauer Kreis
      ctx.beginPath();
      ctx.arc(drawX, drawY, 30, 0, 2*Math.PI);
      ctx.fillStyle = '#4BBDFF';
      ctx.fill();
    } else {
      // Player
      ctx.beginPath();
      ctx.arc(drawX, drawY, 10, 0, 2*Math.PI);
      ctx.fillStyle = (id === myId) ? 'red' : 'black';
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.font = '14px sans-serif';
      ctx.fillText(`${p.name}(Lv.${p.level})`, drawX - 25, drawY - 15);
    }
  }
  ctx.restore();

  // Score-Anzeige
  ctx.fillStyle = 'black';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Score: ${me.score}`, 20, 30);
}
requestAnimationFrame(gameLoop);
