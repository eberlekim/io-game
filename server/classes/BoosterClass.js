/**
 * BoosterClass.js (Server-Side)
 * ---------------------------------------------------------------
 * Defines multiple "sub-shapes" that together form the collision 
 * data for the BaseClass. For now we use a circle and a rect 
 * as an example. We also include a 'debugColor' for rendering 
 * the hitboxes on the client in debug mode.
 */

const BoosterClass = {
    className: "BoosterClass",
  
    // We'll store all sub-shapes in a single array:
    shapes: [
      {
        // Example spike as a rectangle
        type: 'rect',
        offsetX: -8,
        offsetY: -20,
        width: 16,
        height: 40,
        debugColor: 'rgba(0,255,0,0.3)' // green & transparent
      }
    ]
  };
  
  module.exports = BoosterClass;
  