/***********************************************************
 * server/game.js
 *   - Hauptspiel-Logik: verwaltet players, 
 *     initialisiert Events, ruft handlePhysics() auf.
 ************************************************************/
const Player = require('./player');
const { handlePhysics } = require('./physics');
const { FPS } = require('./config');

// In diesem Objekt halten wir alle Player-Instanzen
// key = socket.id, value = Player
const players = {};

/**
 * Init-Funktion, die wir in index.js aufrufen,
 * damit wir Zugriff auf das 'io' (Socket.io) haben.
 */
function initGame(io) {

  // Socket.io Events
  io.on('connection', (socket) => {
    console.log('Neuer Spieler:', socket.id);

    // Player anlegen
    players[socket.id] = new Player(socket.id);

    // Wenn Client WASD/Boost schickt
    socket.on('moveKeys', (keys) => {
      if (players[socket.id]) {
        players[socket.id].up    = keys.up;
        players[socket.id].down  = keys.down;
        players[socket.id].left  = keys.left;
        players[socket.id].right = keys.right;
        players[socket.id].boost = keys.boost;
      }
    });

    // (Optional) Client sendet Name
    socket.on('playerName', (name) => {
      if (players[socket.id]) {
        players[socket.id].name = name || 'Unknown';
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
      delete players[socket.id];
    });
  });

  // Game Loop
  setInterval(() => {
    // 1) Physik aktualisieren
    handlePhysics(players);

    // 2) State an alle senden
    //    (Clients rendern das)
    io.emit('state', players);
  }, 1000 / FPS);
}

module.exports = initGame;
