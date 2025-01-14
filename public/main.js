console.log("[CLIENT] main.js loaded!");

const startScreen = document.getElementById('startScreen');
const nameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const deathScreen = document.getElementById('deathScreen');
const deathScore = document.getElementById('deathScore');
const retryBtn = document.getElementById('retryBtn');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas = Fenstergröße
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ws = null;
let myId = null;
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

retryBtn.addEventListener('click', () => {
  location.reload();
});

// Steuerung
let inputKeys = { up:false, down:false, left:false, right:false, boost:false };

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
 * Stellt eine WebSocket-Verbindung her.
 * - Render => HTTPS => wss://
 * - Lokal => ws://
 */
function connectWs(playerName) {
  let portPart = location.port ? (':' + location.port) : '';
  let hostPart = location.hostname;
  
  let protocolPart = 'ws:';
  if (location.protocol === 'https:') {
    protocolPart = 'wss:';
  }

  // Debug
  console.log("connectWs ->", protocolPart, "//", hostPart, portPart);
  const wsUrl = `${protocolPart}//${hostPart}${portPart}`;
  console.log("Final WebSocket URL:", wsUrl);

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("[CLIENT] WS connected -> sending spawnPlayer & playerName");
    ws.send(JSON.stringify({ type: 'spawnPlayer' }));
    ws.send(JSON.stringify({ type: 'playerName', name: playerName }));
  };

  ws.onmessage = (evt) => {
    console.log("WS onmessage raw =>", evt.data);
    let msg;
    try {
      msg = JSON.parse(evt.data);
    } catch(e) {
      console.error("Invalid JSON from server:", evt.data);
      return;
    }

    if (msg.type === 'yourId') {
      myId = msg.id;
      console.log("Got myId:", myId);
    }
    else if (msg.type === 'state') {
      players = msg.players;
      // Check if wir tot
      if (myId) {
        const me = players[myId];
        if (!me || me.dead) {
          if (isAlive) showDeathScreen();
          isAlive = false;
        }
      }
    }
    else {
      console.log("Unknown msg.type:", msg.type);
    }
  };

  ws.onclose = (evt) => {
    console.log("[CLIENT] WS disconnected code=", evt.code, "reason=", evt.reason);
    if (isAlive) showDeathScreen();
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

function showDeathScreen() {
  if (players[myId]) {
    deathScore.textContent = players[myId].score || 0;
  }
  deathScreen.style.display = 'block';
  canvas.style.display = 'none';
}

// Render-Loop
function gameLoop() {
  requestAnimationFrame(gameLoop);
  if (!isAlive) return;
  if (!myId) return;

  const me = players[myId];
  if (!me) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const offsetX = canvas.width / 2 - me.x;
  const offsetY = canvas.height / 2 - me.y;

  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.fillRect(offsetX, offsetY, 500, 500);

  // Zeichne alle
  for (const id in players) {
    const p = players[id];
    if (p.dead) continue;

    const drawX = p.x + offsetX;
    const drawY = p.y + offsetY;

    if (p.isAi) {
      // NPC
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
