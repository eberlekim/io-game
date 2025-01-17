/**
 * BaseClass.js (Server-Side)
 * ---------------------------------------------------------------
 * This file defines the collision data for the "BaseClass" shape.
 * Currently, the physics engine only uses a simple circle ("body")
 * for collision. However, we've included optional spikes and
 * vulnerable parts for future use when polygon collisions are
 * implemented. Each section can be circle/rect/polygon, etc.
 * 
 * Usage:
 *   - The server will attach this object (or reference to it) to
 *     a player's "classType" property.
 *   - In the future, when polygon collision is active, these shapes
 *     can be used for precise collisions.
 */

const BaseClass = {
    // A human-readable identifier
    className: "BaseClass",
  
    // MAIN BODY: Currently we only use radius for circle-based collision.
    // But if we had polygon collisions, we could store:
    //    type: 'polygon' or type: 'rect' with coordinates, etc.
    body: {
      type: 'circle',
      radius: 15,   // matches the "this.radius" in Player.js
    },
  
    // SPIKES: Example placeholders for future expansions
    // (Not used by the current physics; but available for later).
    spikes: [
      {
        type: 'polygon',
        offsetX: 0,
        offsetY: -20,
        // Simple triangle shape (points relative to offsetX, offsetY)
        points: [
          { x: 0,  y: -10 },
          { x: 10, y: 10 },
          { x: -10, y: 10 },
        ],
      }
    ],
  
    // VULNERABLE AREA: Example placeholder circle
    // (Again, unused in the current circle vs. circle collisions).
    vulnerable: {
      type: 'circle',
      offsetX: 0,
      offsetY: 10,
      radius: 8,
    }
  };
  
  module.exports = BaseClass;
  