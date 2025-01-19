/**
 * BaseClass.js (Server-Side)
 * ---------------------------------------------------------------
 * Defines multiple "sub-shapes" that together form the collision 
 * data for the BaseClass. For now we use a circle and a rect 
 * as an example. We also include a 'debugColor' for rendering 
 * the hitboxes on the client in debug mode.
 */

const BaseClass = {
  className: "BaseClass",

  // We'll store all sub-shapes in a single array:
  shapes: [
    {
      // Main circle body
      type: 'circle',
      offsetX: 0,
      offsetY: 0,
      radius: 15,
      debugColor: 'rgba(255,0,0,0.3)' // red & transparent
    },

    /*
    {
      // Example spike as a rectangle
      type: 'rect',
      offsetX: 15,  // to the right of the circle
      offsetY: -5,
      width: 100,
      height: 100,
      debugColor: 'rgba(0,255,0,0.3)' // green & transparent
    }
    */
  ]
};

module.exports = BaseClass;
