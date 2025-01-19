// public/classes/CommonEntityRenderer.js
window.CommonEntityRenderer = class CommonEntityRenderer {
    constructor(playerState) {
      // Wurzel-Container
      this.rootEl = document.createElement("div");
      this.rootEl.style.position = "absolute";
      this.rootEl.style.width = "0px";
      this.rootEl.style.height = "0px";
  
      // Name-Label
      this.labelEl = document.createElement("div");
      this.labelEl.style.position = "absolute";
      this.labelEl.style.left = "-30px";
      this.labelEl.style.bottom = "40px";
      this.labelEl.style.whiteSpace = "nowrap";
      this.labelEl.style.fontSize = "14px";
      this.labelEl.style.fontWeight = "bold";
      this.labelEl.style.color = "#fff";
      this.rootEl.appendChild(this.labelEl);
  
      // Container, in dem das Klassen-spezifische Shape liegt
      this.shapeContainer = document.createElement("div");
      this.shapeContainer.style.position = "absolute";
      this.rootEl.appendChild(this.shapeContainer);
  
      // Debug-Hitbox Elemente
      this.hitboxEls = [];
    }
  
    update(playerState, debugMode) {
      // 1) Positionierung
      this.rootEl.style.transform = `translate(${playerState.x}px, ${playerState.y}px)`;
  
      // 2) Name / Level
      this.labelEl.textContent = `${playerState.name} (Level: ${playerState.level})`;
  
      // 3) Debug-Shapes neu zeichnen
      this.hitboxEls.forEach(el => el.remove());
      this.hitboxEls = [];
  
      if (debugMode && playerState.shapes) {
        for (let shape of playerState.shapes) {
          const debugEl = this.drawHitbox(shape);
          if (debugEl) {
            this.rootEl.appendChild(debugEl);
            this.hitboxEls.push(debugEl);
          }
        }
      }
    }
  
    drawHitbox(shape) {
      // Zeichnet einen <div>, der circle/rect anzeigt
      const el = document.createElement("div");
      el.style.position = "absolute";
  
      if (shape.type === 'circle') {
        el.style.left   = (shape.offsetX - shape.radius) + "px";
        el.style.top    = (shape.offsetY - shape.radius) + "px";
        el.style.width  = (shape.radius * 2) + "px";
        el.style.height = (shape.radius * 2) + "px";
        el.style.borderRadius = "50%";
      } else if (shape.type === 'rect') {
        el.style.left   = shape.offsetX + "px";
        el.style.top    = shape.offsetY + "px";
        el.style.width  = shape.width + "px";
        el.style.height = shape.height + "px";
      } else {
        return null; // fallback
      }
  
      el.style.backgroundColor = shape.debugColor || "rgba(255,255,0,0.3)";
      el.style.pointerEvents = "none";
      return el;
    }
  
    remove() {
      this.hitboxEls.forEach(el => el.remove());
      this.hitboxEls = [];
      if (this.rootEl.parentNode) {
        this.rootEl.parentNode.removeChild(this.rootEl);
      }
    }
  };
  