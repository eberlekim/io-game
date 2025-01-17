/**
 * BaseClassRender.js (Client-Side)
 * ---------------------------------------------------------------
 * Renders the "BaseClass" shape as an SVG, with the player's name
 * displayed above the shape. Positioning is handled by `.update()`,
 * which moves an absolutely-positioned root element.
 *
 * Usage:
 *   const renderer = new BaseClassRender(playerState);
 *   document.getElementById("map").appendChild(renderer.rootEl);
 *   ...
 *   renderer.update(newPlayerState);
 */

window.BaseClassRender = class BaseClassRender {
    constructor(playerState) {
      // The root element that holds both the SVG and the name label
      this.rootEl = document.createElement("div");
      this.rootEl.style.position = "absolute";
      this.rootEl.style.width = "0px";
      this.rootEl.style.height = "0px";
  
      // Create the name label (above the shape)
      this.labelEl = document.createElement("div");
      this.labelEl.textContent = playerState.name || "BaseClass";
      this.labelEl.style.position = "absolute";
      // Position the label ~20px above the shape center
      // (since shape center is effectively (0,0) in the rootEl)
      this.labelEl.style.left = "-30px"; 
      this.labelEl.style.bottom = "40px"; 
      this.labelEl.style.whiteSpace = "nowrap";
      this.labelEl.style.fontSize = "14px";
      this.labelEl.style.fontWeight = "bold";
      this.labelEl.style.color = "#fff";
  
      // Optional background or styling
      // this.labelEl.style.background = "rgba(0,0,0,0.3)";
  
      this.rootEl.appendChild(this.labelEl);
  
      // Create a container for the SVG shape
      this.svgContainer = document.createElement("div");
      this.svgContainer.innerHTML = this.getSvgCode();
      // Position the shape so that its center is at (0,0)
      // We'll offset by half the SVG's width/height if needed
      this.svgContainer.style.position = "absolute";
      this.svgContainer.style.left = "-15px"; // half of 30
      this.svgContainer.style.top  = "-15px"; // half of 30
  
      this.rootEl.appendChild(this.svgContainer);
    }
  
    /**
     * Returns the SVG code for the shape.
     * You can replace this path with your own star or circle from Figma.
     * For now, let's just do a small green circle in a 30x30 box.
     */
    getSvgCode() {
      return `
<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.8985 11.0932L17.0418 11.6881L17.5962 11.4292L25.0343 7.95577L19.9928 14.4345L19.617 14.9174L20.1651 15.1894L27.5184 18.8392L19.3098 18.937L18.6979 18.9443L18.827 19.5424L20.5582 27.5669L15.3637 21.2102L14.9766 20.7364L14.5894 21.2102L9.39493 27.5669L11.1262 19.5424L11.2552 18.9443L10.6434 18.937L2.43474 18.8392L9.78801 15.1894L10.3361 14.9174L9.96031 14.4345L4.9188 7.95577L12.3569 11.4292L12.9114 11.6881L13.0546 11.0932L14.9766 3.11221L16.8985 11.0932Z" fill="#0C0076" stroke="#B1FF8F"/>
</svg>

      `;
    }
  
    /**
     * Called each frame (or each update) to reposition the shape
     * based on the latest player coordinates (p.x, p.y).
     */
    update(playerState) {
      // Position the root element so that (p.x, p.y) is the center
      this.rootEl.style.transform = `translate(${playerState.x}px, ${playerState.y}px)`;
  
      // Create a rotating animation by using the current timestamp
      const rotationSpeed = 0.1; // Reduced from 0.05 for slower rotation
      const rotation = (Date.now() * rotationSpeed) % 360;
      this.svgContainer.style.transform = `rotate(${rotation}deg)`;


      // Update the label text or style if needed
      this.labelEl.textContent = playerState.name + " (L" + playerState.level + ")";
    }
  
    /**
     * Optional cleanup if you ever remove this shape from the DOM.
     */
    remove() {
      if (this.rootEl.parentNode) {
        this.rootEl.parentNode.removeChild(this.rootEl);
      }
    }
  };
  