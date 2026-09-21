/**
 * TransitionManager.js — Handles smooth fade/slide transitions between scenes
 */
export class TransitionManager {
  constructor(sceneLayerElement) {
    this.sceneLayer = sceneLayerElement;
    this.overlay = null;
  }

  createOverlay() {
    if (!this.overlay) {
      this.overlay = document.createElement("div");
      this.overlay.className = "transition-overlay";
      this.overlay.style.cssText = [
        "position: absolute",
        "top: 0", "left: 0", "width: 100%", "height: 100%",
        "background: #000",
        "opacity: 0",
        "pointer-events: none",
        "transition: opacity 0.5s ease",
        "z-index: 999"
      ].join(";");
      this.sceneLayer.appendChild(this.overlay);
    }
    return this.overlay;
  }

  async fadeIn(duration = 500) {
    const overlay = this.createOverlay();
    overlay.style.opacity = "0";
    return new Promise(resolve => {
      setTimeout(() => {
        overlay.style.display = "none";
        resolve();
      }, duration);
    });
  }

  async fadeOut(duration = 500) {
    const overlay = this.createOverlay();
    overlay.style.display = "block";
    overlay.style.opacity = "1";
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  async fadeBetween(fromElement, toElement, duration = 600) {
    await this.fadeOut(duration / 2);
    if (fromElement) fromElement.style.display = "none";
    if (toElement) {
      toElement.style.display = "block";
      toElement.style.opacity = "0";
      toElement.style.transition = "opacity 0.3s ease";
      requestAnimationFrame(() => {
        toElement.style.opacity = "1";
      });
    }
    await this.fadeIn(duration / 2);
  }

  async slideBetween(fromElement, toElement, direction = "left", duration = 500) {
    const distance = "100%";
    if (toElement) {
      toElement.style.position = "absolute";
      toElement.style.top = "0";
      toElement.style.left = direction === "left" ? distance : `-${distance}`;
      toElement.style.width = "100%";
      toElement.style.opacity = "1";
      toElement.style.transition = "left 0.5s ease, opacity 0.3s";
      this.sceneLayer.appendChild(toElement);
    }
    await this.fadeOut(100);
    if (fromElement) {
      fromElement.style.transition = "left 0.5s ease, opacity 0.3s";
      fromElement.style.left = direction === "left" ? `-${distance}` : distance;
    }
    if (toElement) {
      toElement.style.left = "0";
    }
    await new Promise(resolve => setTimeout(resolve, duration));
    await this.fadeIn(100);
    if (fromElement && fromElement.parentNode) fromElement.parentNode.removeChild(fromElement);
  }

  removeOverlay() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
    }
  }
}

export default TransitionManager;
