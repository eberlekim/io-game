/***********************************************************
 * server/config.js
 *   - Zentrale Konstanten für das Spiel
 ************************************************************/
module.exports = {
  // Spielfeld
  FIELD_WIDTH: 2000,
  FIELD_HEIGHT: 2000,

  // Physik
  ACCELERATION: 0.2, // Stärke bei WASD
  FRICTION: 0.98,    // "Eis"-Effekt
  PLAYER_RADIUS: 10,

  // Boost
  BOOST_STRENGTH: 1.5,
  BOOST_COOLDOWN: 5000, // 5 Sekunden

  // Ticks pro Sekunde (GameLoop)
  FPS: 60
};
