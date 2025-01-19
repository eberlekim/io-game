// public/classes/BoosterClassRender.js
window.BoosterClassRender = class BoosterClassRender extends CommonEntityRenderer {
    constructor(playerState) {
      super(playerState); // init rootEl, labelEl, etc.
  
      // Erstelle das spezielle SVG für BoosterClass
      this.svgContainer = document.createElement("div");
      this.svgContainer.innerHTML = this.getSvgCode();
      this.svgContainer.style.position = "absolute";
  
      // Damit der SVG-Mittelpunkt bei (0,0) liegt
      this.svgContainer.style.left = "-8px";
      this.svgContainer.style.top  = "-20px";
  
      // Hänge ans shapeContainer
      this.shapeContainer.appendChild(this.svgContainer);
    }

    getSvgCode() {
      // Dein spezielles BoosterClass-SVG
      return `
<svg width="16" height="41" viewBox="0 0 16 41" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.54242 35.8182L8.47906 3.1235L15.4185 35.8181L8.47831 40.1263L1.54242 35.8182Z" fill="#C80505" stroke="#FF3636"/>
</svg>

      `;
    }
  
    update(playerState, debugMode) {
      super.update(playerState, debugMode);
    }
  };
  