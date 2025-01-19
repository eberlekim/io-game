// public/classes/BaseClassRender.js
window.BaseClassRender = class BaseClassRender extends CommonEntityRenderer {
  constructor(playerState) {
    super(playerState); // init rootEl, labelEl, etc.

    // Erstelle das spezielle SVG für BaseClass
    this.svgContainer = document.createElement("div");
    this.svgContainer.innerHTML = this.getSvgCode();
    this.svgContainer.style.position = "absolute";

    // Damit der SVG-Mittelpunkt bei (0,0) liegt
    this.svgContainer.style.left = "-15px";
    this.svgContainer.style.top  = "-15px";

    // Hänge ans shapeContainer
    this.shapeContainer.appendChild(this.svgContainer);
  }

  getSvgCode() {
    // Dein spezielles BaseClass-SVG
    return `
<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.1837 10.7807L17.3269 11.3756L17.8813 11.1167L25.3195 7.64327L20.278 14.122L19.9022 14.6049L20.4503 14.8769L27.8035 18.5267L19.5949 18.6245L18.9831 18.6318L19.1121 19.2299L20.8434 27.2544L15.6489 20.8977L15.2617 20.4239L14.8745 20.8977L9.68008 27.2544L11.4113 19.2299L11.5403 18.6318L10.9285 18.6245L2.7199 18.5267L10.0732 14.8769L10.6212 14.6049L10.2455 14.122L5.20396 7.64327L12.6421 11.1167L13.1965 11.3756L13.3398 10.7807L15.2617 2.79971L17.1837 10.7807Z" fill="#3A3A3A" stroke="#4F4F4F"/>
</svg>

    `;
  }

  update(playerState, debugMode) {
    super.update(playerState, debugMode);
    // Falls du z. B. noch eine Rotation machen willst:
    // this.svgContainer.style.transform = `rotate(...)`;
  }
};
