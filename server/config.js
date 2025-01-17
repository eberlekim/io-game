// This is the game's configuration file that:
// 1. Sets up the game's basic measurements and rules
// 2. Controls how the game feels and plays
// 3. Makes it easy to adjust game settings in one place

module.exports = {
  // Game field size (in pixels)
  FIELD_WIDTH: 1000,      // How wide the game area is
  FIELD_HEIGHT: 1000,     // How tall the game area is

  // Entity sizes (in pixels)
  PLAYER_RADIUS: 15,      // How big players are
  NPC_RADIUS: 15,         // How big NPCs are

  // Movement settings
  ACCELERATION: 0.2,      // How quickly things speed up
  FRICTION: 0.93,         // How quickly things slow down (1 = no friction, 0 = instant stop)

  // Power-up settings (not used yet)
  BOOST_STRENGTH: 2.5,    // How powerful speed boosts are
  BOOST_COOLDOWN: 3000,   // How long between boosts (in milliseconds)
};
