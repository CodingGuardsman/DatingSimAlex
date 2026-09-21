/**
 * EndOfDayScene.js — Shows end-of-day summary with fade-in day notification
 */
import Scene from "./Scene.js";

export class EndOfDayScene extends Scene {
  constructor(stateManager, eventBus, uiManager, sceneLayer) {
    super(stateManager, eventBus, uiManager, sceneLayer);
  }

  async enter(params = {}) {
    this.params = params;

    // Set background
    this.uiManager.renderBackground("campus");
    this.uiManager.renderLocationLabel("End of Day");

    const state = this.stateManager.state;

    // Show day notification in center with fade-in
    this._showDayNotification(state.day);

    // Render end-of-day summary
    this.uiManager.renderEndOfDay(state, () => {
      this._onContinue();
    });
  }

  _showDayNotification(day) {
    let notif = document.getElementById("day-notification");
    if (!notif) {
      notif = document.createElement("div");
      notif.id = "day-notification";
      this.sceneLayer.appendChild(notif);
    }
    notif.innerHTML = "";
    notif.style.cssText = "position:absolute;inset:0;display:flex;justify-content:center;align-items:center;z-index:5;opacity:0;transition:opacity 0.8s ease-in;";

    const content = document.createElement("div");
    content.style.textAlign = "center";

    const title = document.createElement("h2");
    title.textContent = "Day " + day + " Complete";
    title.style.cssText = "color:#fff;font-size:2rem;margin:0 0 0.5rem 0;text-shadow:0 2px 8px rgba(0,0,0,0.8);";
    content.appendChild(title);

    const subtitle = document.createElement("p");
    subtitle.textContent = "Rest well. Tomorrow brings new clues.";
    subtitle.style.cssText = "color:rgba(255,255,255,0.8);font-size:1rem;";
    content.appendChild(subtitle);

    notif.appendChild(content);

    // Fade in on next frame
    setTimeout(() => {
      notif.style.opacity = "1";
    }, 50);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      notif.style.opacity = "0";
      notif.style.transition = "opacity 0.5s ease-out";
      setTimeout(() => {
        notif.style.display = "none";
      }, 500);
    }, 3000);
  }

  _onContinue() {
    this.eventBus.emit("end_of_day:continue", {});
  }

  exit() {
    super.exit();
    const notif = document.getElementById("day-notification");
    if (notif) notif.style.display = "none";
  }
}

export default EndOfDayScene;