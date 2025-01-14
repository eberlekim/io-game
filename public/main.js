console.log("[CLIENT] main.js loaded!");

const startScreen = document.getElementById('startScreen');
const nameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const deathScreen = document.getElementById('deathScreen');
const deathScore = document.getElementById('deathScore');
const retryBtn = document.getElementById('retryBtn');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ws = null;
let myId = null;
let players = {};
let isAlive = false;

// Start
startBtn.addEventListener('click', () => {
  const name = nameInput.value.trim() || 'NoName';
  connectWs(name);

  console.log("[CLIENT] Hiding startScreen, showing canvas");
  startScreen.style.display = 'none';
  canvas.style.display = 'block';
  deathScreen.style.display = 'none';
  isAlive = true;
});

retryBtn.addEventListener('click', () => {
  location.reload();
});

// Steuerung
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

/** Stellt WebSocket-Verbindung her */
function connectWs(playerName) {
  let protocolPart = (location.protocol === 'https:') ? 'wss:' : 'ws:';
  let portPart = location.port ? (':' + location.port) : '';
  let hostPart = location.hostname;

  const wsUrl = `${protocolPart}//${hostPart}${portPart}`;
  console.log("[CLIENT] connectWs ->", wsUrl);

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("[CLIENT] WS connected -> sending spawnPlayer & playerName");
    ws.send(JSON.stringify({ type:'spawnPlayer' }));
    ws.send(JSON.stringify({ type:'playerName', name:playerName }));
  };

  ws.onmessage = (evt) => {
    console.log("[CLIENT] WS onmessage RAW =>", evt.data);

    let msg;
    try {
      msg = JSON.parse(evt.data);
    } catch (e) {
      console.error("[CLIENT] Invalid JSON from server", evt.data);
      return;
    }

    if (msg.type === 'yourId') {
      myId = msg.id;
      console.log("[CLIENT] Got myId:", myId);

    } else if (msg.type === 'state') {
      players = msg.players;
      // Prüfen, ob wir tot sind
      if (myId) {
        const me = players[myId];
        if (!me) {
          console.log("[CLIENT] No 'me' in players => showDeathScreen");
          showDeathScreen("No entry for me in server state!");
          return;
        }
        if (me.dead) {
          console.log("[CLIENT] me.dead === true => showDeathScreen");
          showDeathScreen("Server says I'm dead");
          return;
        }
      }

    } else {
      console.log("[CLIENT] Unknown msg.type:", msg.type);
    }
  };

  ws.onclose = (evt) => {
    console.log("[CLIENT] WS disconnected code=", evt.code, "reason=", evt.reason);
    if (isAlive) {
      showDeathScreen("WebSocket closed");
    }
  };
}

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

/** Zeigt DeathScreen */
function showDeathScreen(reason) {
  console.log("[CLIENT] showDeathScreen called. reason =", reason);
  if (players[myId]) {
    deathScore.textContent = players[myId].score || 0;
  } else {
    deathScore.textContent = "?";
  }
  deathScreen.style.display = 'block';
  canvas.style.display = 'none';
  isAlive = false;
}

/** Render-Loop */
function gameLoop() {
  requestAnimationFrame(gameLoop);
  if (!isAlive) return;
  if (!myId) return; // noch keine ID -> abwarten

  const me = players[myId];
  if (!me) return; // abwarten bis wir was haben

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Kamera-Offset
  const offsetX = canvas.width/2 - me.x;
  const offsetY = canvas.height/2 - me.y;

  // Weißes Spielfeld
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.fillRect(offsetX, offsetY, 500, 500);

  // Alle zeichnen
  for (const id in players) {
    const p = players[id];
    if (p.dead) continue; // tote ignorieren

    const drawX = p.x + offsetX;
    const drawY = p.y + offsetY;

    if (p.isAi) {
      // NPC = großer blauer Kreis
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

  // Score
  ctx.fillStyle = 'black';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Score: ${me.score}`, 20, 30);
}
requestAnimationFrame(gameLoop);
