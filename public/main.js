console.log("[CLIENT] main.js loaded!");

const socket = io();

const startScreen = document.getElementById('startScreen');
const nameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const deathScreen = document.getElementById('deathScreen');
const deathScore = document.getElementById('deathScore');
const retryBtn = document.getElementById('retryBtn');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas soll Fenster füllen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let inputKeys = { up:false, down:false, left:false, right:false, boost:false };
let myId = null;
let players = {};
let isAlive = false;

// Werte für Radius etc. (müssen zum Server-Code passen)
const PLAYER_RADIUS = 10;
const NPC_RADIUS = 30;

// Für die exakte Zentrierung des Stern-SVG:
const STAR_OFFSET_X = 30.5459; 
const STAR_OFFSET_Y = 30.046;

// Originaler Stern-Pfad
const starPath = new Path2D(
  "M30.5459 0.0460052L33.4723 15.3342L42.0264 2.32962L38.8795 17.574L51.7591 8.8328L43.0179 21.7125L58.2623 18.5655L45.2577 27.1196L60.5459 30.046L45.2577 32.9724L58.2623 41.5265L43.0179 38.3796L51.7591 51.2592L38.8795 42.5181L42.0264 57.7624L33.4723 44.7578L30.5459 60.046L27.6195 44.7578L19.0654 57.7624L22.2123 42.5181L9.3327 51.2592L18.0739 38.3796L2.82951 41.5265L15.8341 32.9724L0.545898 30.046L15.8341 27.1196L2.82951 18.5655L18.0739 21.7125L9.3327 8.8328L22.2123 17.574L19.0654 2.32962L27.6195 15.3342L30.5459 0.0460052Z"
);

// Start
startBtn.addEventListener('click', () => {
  const name = nameInput.value.trim() || 'NoName';
  socket.emit('spawnPlayer');
  socket.emit('playerName', name);

  startScreen.style.display = 'none';
  canvas.style.display = 'block';
  deathScreen.style.display = 'none';
  isAlive = true;
});

// Retry
retryBtn.addEventListener('click', () => {
  location.reload();
});

// Tastatur
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
  sendKeys();
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
  sendKeys();
});
function sendKeys() {
  socket.emit('moveKeys', inputKeys);
}

// Socket
socket.on('connect', () => {
  myId = socket.id;
});

socket.on('state', serverPlayers => {
  players = serverPlayers;
  if (!players[myId] || players[myId].dead) {
    if (isAlive) showDeathScreen();
    isAlive = false;
    return;
  }
});

// Death-Screen
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
  if (!players[myId]) return;

  const me = players[myId];
  // Kamera-Offset
  const offsetX = canvas.width / 2 - me.x;
  const offsetY = canvas.height / 2 - me.y;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Spielfeld (500×500)
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
      // NPC = Stern
      ctx.save();
      ctx.translate(drawX - STAR_OFFSET_X, drawY - STAR_OFFSET_Y);
      ctx.fillStyle = '#4BBDFF';
      ctx.fill(starPath);
      ctx.restore();

    } else {
      // Player = Kreis
      ctx.beginPath();
      ctx.arc(drawX, drawY, PLAYER_RADIUS, 0, 2 * Math.PI);
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
