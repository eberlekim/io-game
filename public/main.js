/***********************************************************
 * public/main.js
 *   - Clientseitige Logik: Canvas zeichnen,
 *     Tastatur abfragen, Startscreen, ...
 ************************************************************/
const socket = io();

// DOM-Elemente
const startScreen = document.getElementById('startScreen');
const nameInput   = document.getElementById('nameInput');
const startBtn    = document.getElementById('startBtn');
const deathScreen = document.getElementById('deathScreen');
const deathScore  = document.getElementById('deathScore');
const retryBtn    = document.getElementById('retryBtn');

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// Canvas-Größe
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Eingabestatus
let inputKeys = { up: false, down: false, left: false, right: false, boost: false };
let myId = null;
let players = {}; // vom Server
let isAlive = true; // oder false, wenn man "raus" ist

/***********************************************************
 * Startscreen-Logik
 ************************************************************/
startBtn.addEventListener('click', () => {
  // Name abfragen
  const name = nameInput.value.trim() || 'NoName';
  // An Server schicken
  socket.emit('playerName', name);

  // UI umschalten
  startScreen.style.display = 'none';
  canvas.style.display      = 'block'; // zeige Canvas
  deathScreen.style.display = 'none';
  isAlive = true;
});

/***********************************************************
 * Deathscreen-Logik
 ************************************************************/
retryBtn.addEventListener('click', () => {
  // Einfach neu laden oder an Server info, etc.
  location.reload();
});

/***********************************************************
 * Tastatur
 ************************************************************/
window.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'w':
    case 'ArrowUp':
      inputKeys.up = true; break;
    case 's':
    case 'ArrowDown':
      inputKeys.down = true; break;
    case 'a':
    case 'ArrowLeft':
      inputKeys.left = true; break;
    case 'd':
    case 'ArrowRight':
      inputKeys.right = true; break;
    case ' ':
      inputKeys.boost = true; break;
  }
  sendKeys();
});

window.addEventListener('keyup', (e) => {
  switch(e.key) {
    case 'w':
    case 'ArrowUp':
      inputKeys.up = false; break;
    case 's':
    case 'ArrowDown':
      inputKeys.down = false; break;
    case 'a':
    case 'ArrowLeft':
      inputKeys.left = false; break;
    case 'd':
    case 'ArrowRight':
      inputKeys.right = false; break;
    case ' ':
      inputKeys.boost = false; break;
  }
  sendKeys();
});

function sendKeys() {
  socket.emit('moveKeys', inputKeys);
}

/***********************************************************
 * Socket.io Events
 ************************************************************/
socket.on('connect', () => {
  myId = socket.id;
});

socket.on('state', (serverPlayers) => {
  players = serverPlayers;

  // Optional: prüfen, ob wir "tot" sind
  // (z. B. wenn wir das Spielfeld verlassen haben)
  // Hier nur ein Dummy-Check
  if (!players[myId]) {
    // Wir existieren nicht mehr auf dem Server
    isAlive = false;
    showDeathScreen();
  }
});

/***********************************************************
 * Deathscreen anzeigen
 ************************************************************/
function showDeathScreen() {
  deathScore.textContent = '???'; // setze Score, falls du willst
  deathScreen.style.display = 'block';
  canvas.style.display      = 'none';
}

/***********************************************************
 * Zeichnen (Canvas)
 ************************************************************/
function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (!isAlive) {
    // Falls tot: Canvas bleibt leer
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!myId || !players[myId]) {
    // Noch nicht gestartet / nicht auf dem Server
    return;
  }

  const me = players[myId];
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Wir verschieben das Spielfeld so, dass "me" in der Mitte ist
  const offsetX = centerX - me.x;
  const offsetY = centerY - me.y;

  // Spielfeldgroesse
  const FIELD_WIDTH  = 2000;
  const FIELD_HEIGHT = 2000;
  const PLAYER_RADIUS = 10;

  // Zeichne grauen Hintergrund
  ctx.fillStyle = '#ccc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Zeichne weißes Spielfeld
  const fieldLeft = -FIELD_WIDTH / 2;
  const fieldTop  = -FIELD_HEIGHT / 2;
  ctx.fillStyle = '#fff';
  ctx.fillRect(
    fieldLeft + offsetX,
    fieldTop + offsetY,
    FIELD_WIDTH,
    FIELD_HEIGHT
  );

  // Zeichne alle Spieler
  for (const id in players) {
    const p = players[id];
    const drawX = p.x + offsetX;
    const drawY = p.y + offsetY;

    // Kreis
    ctx.beginPath();
    ctx.arc(drawX, drawY, PLAYER_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = (id === myId) ? 'red' : 'black';
    ctx.fill();
  }
}

requestAnimationFrame(gameLoop);
