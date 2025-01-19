// physics.js
// ---------------------------------------------------------------
// This is the game's physics engine that:
// 1. Handles movement/friction for all entities
// 2. Processes collisions using multi-shape approach
// 3. Applies bounce/knockback
// 4. Kills entities that leave map

const {
    ACCELERATION,
    FRICTION,
    FIELD_WIDTH,
    FIELD_HEIGHT
  } = require('./config');
  




  
  // Import your server classes
  const BaseClass = require('./classes/BaseClass');
  const BoosterClass = require('./classes/BoosterClass');
  const NpcClass  = require('./classes/NpcClass');
  // const SpikeClass = require('./classes/SpikeClass');
  
  function getClassData(type) {
    if (type === "BaseClass") return BaseClass;
    if (type === "BoosterClass") return BoosterClass;
    if (type === "NpcClass")  return NpcClass;
    return null;
  }







  
  function handlePhysics(players) {
    const ids = Object.keys(players);
  
    // 1) Movement & boundary check
    for (let id of ids) {
      const p = players[id];
      if (p.dead) continue;
  
      // Movement (AI or WASD)
      if (p.isAi && typeof p.updateAi === 'function') {
        p.updateAi();
      } else {
        if (p.up)    p.vy -= ACCELERATION;
        if (p.down)  p.vy += ACCELERATION;
        if (p.left)  p.vx -= ACCELERATION;
        if (p.right) p.vx += ACCELERATION;
      }
  
      // Friction
      p.vx *= FRICTION;
      p.vy *= FRICTION;
  
      // Update position
      p.x += p.vx;
      p.y += p.vy;
  
      // Kill if out of bounds
      if (p.x < 0 || p.x > FIELD_WIDTH || p.y < 0 || p.y > FIELD_HEIGHT) {
        p.dead = true;
      }
    }
  
    // 2) Collisions (naive O(n^2))
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const p1 = players[ids[i]];
        const p2 = players[ids[j]];
        if (p1.dead || p2.dead) continue;
  
        // Multi-shape broad-phase
        if (!multiShapeBroadPhase(p1, p2)) {
          continue; // skip detail check
        }
  
        // Detailed check
        if (checkCollision(p1, p2)) {
          bounce(p1, p2);
        }
      }
    }
  }
  
  /**
   * multiShapeBroadPhase(p1, p2)
   * Checks if ANY sub-shape pair is "potentially colliding".
   * 
   * - If we find circle–circle, we do a quick distance check. 
   * - If we find rect/circle or rect/rect, we simply return true 
   *   to indicate "possible collision" (less precise broad-phase).
   * 
   * -> This ensures that e.g. a rectangle spike also triggers a detail check.
   */
  function multiShapeBroadPhase(p1, p2) {
    const cd1 = getClassData(p1.classType);
    const cd2 = getClassData(p2.classType);
    if (!cd1 || !cd2) return false;
  
    const shapes1 = cd1.shapes || [];
    const shapes2 = cd2.shapes || [];
  
    // Loop over all shape pairs
    for (let s1 of shapes1) {
      for (let s2 of shapes2) {
        // If circle–circle, do a quick dist check
        if (s1.type === 'circle' && s2.type === 'circle') {
          const dx = (p2.x + s2.offsetX) - (p1.x + s1.offsetX);
          const dy = (p2.y + s2.offsetY) - (p1.y + s1.offsetY);
          const distSq = dx*dx + dy*dy;
          const rSum = s1.radius + s2.radius;
          if (distSq <= (rSum*rSum)) {
            return true; // they might collide
          }
        } else {
          // If we have a rect or circle–rect pair, we assume 
          // "possible collision" without further checks. 
          // That’s simpler than making a bounding rect check here.
          return true;
        }
      }
    }
    // If we tested all shape pairs 
    // and found no circle–circle in range => false
    return false;
  }
  
  /**
   * checkCollision(p1, p2)
   * Detailed check: loops over all shape pairs, 
   * if ANY shapePair collides -> return true
   */
  function checkCollision(p1, p2) {
    const cd1 = getClassData(p1.classType);
    const cd2 = getClassData(p2.classType);
    if (!cd1 || !cd2) return false;
  
    const shapes1 = cd1.shapes || [];
    const shapes2 = cd2.shapes || [];
  
    for (let s1 of shapes1) {
      for (let s2 of shapes2) {
        if (shapeCollision(p1, s1, p2, s2)) {
          return true; 
        }
      }
    }
    return false;
  }
  
  /**
   * shapeCollision(p1, s1, p2, s2)
   * Actual collision for circle–circle, rect–rect, circle–rect
   */
  function shapeCollision(p1, s1, p2, s2) {
    if (s1.type === 'circle' && s2.type === 'circle') {
      return circleCircle(p1, s1, p2, s2);
    }
    if (s1.type === 'rect' && s2.type === 'rect') {
      return rectRect(p1, s1, p2, s2);
    }
    if (s1.type === 'circle' && s2.type === 'rect') {
      return circleRect(p1, s1, p2, s2);
    }
    if (s1.type === 'rect' && s2.type === 'circle') {
      return circleRect(p2, s2, p1, s1);
    }
    return false;
  }
  
  function circleCircle(p1, c1, p2, c2) {
    const cx1 = p1.x + c1.offsetX;
    const cy1 = p1.y + c1.offsetY;
    const cx2 = p2.x + c2.offsetX;
    const cy2 = p2.y + c2.offsetY;
    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const distSq = dx*dx + dy*dy;
    const rSum = c1.radius + c2.radius;
    return distSq <= (rSum*rSum);
  }
  
  // AABB rect–rect
  function rectRect(p1, r1, p2, r2) {
    const leftA   = p1.x + r1.offsetX;
    const rightA  = leftA + r1.width;
    const topA    = p1.y + r1.offsetY;
    const bottomA = topA + r1.height;
  
    const leftB   = p2.x + r2.offsetX;
    const rightB  = leftB + r2.width;
    const topB    = p2.y + r2.offsetY;
    const bottomB = topB + r2.height;
  
    return (
      leftA < rightB && rightA > leftB &&
      topA < bottomB && bottomA > topB
    );
  }
  
  // circle vs rect
  function circleRect(p1, c1, p2, r2) {
    const cx = p1.x + c1.offsetX;
    const cy = p1.y + c1.offsetY;
    const rx = p2.x + r2.offsetX;
    const ry = p2.y + r2.offsetY;
    const rw = r2.width;
    const rh = r2.height;
  
    // clamp circle center to rect edges
    let closestX = cx;
    if (cx < rx)        closestX = rx;
    else if (cx > rx+rw) closestX = rx+rw;
  
    let closestY = cy;
    if (cy < ry)         closestY = ry;
    else if (cy > ry+rh) closestY = ry+rh;
  
    const dx = closestX - cx;
    const dy = closestY - cy;
    const distSq = dx*dx + dy*dy;
  
    return distSq <= (c1.radius * c1.radius);
  }
  
  /**
   * bounce(p1, p2):
   * old bounce logic
   */
  function bounce(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
  
    const overlap = 0.1; // small push
    p1.x -= nx * overlap;
    p1.y -= ny * overlap;
    p2.x += nx * overlap;
    p2.y += ny * overlap;
  
    const f1 = p1.isAi ? 0.3 : 3.0;
    const f2 = p2.isAi ? 0.3 : 3.0;
  
    const t1 = p1.vx * nx + p1.vy * ny;
    const t2 = p2.vx * nx + p2.vy * ny;
  
    p1.vx += (t2 - t1) * nx * f1;
    p1.vy += (t2 - t1) * ny * f1;
    p2.vx += (t1 - t2) * nx * f2;
    p2.vy += (t1 - t2) * ny * f2;
  }
  
  module.exports = { handlePhysics };
  