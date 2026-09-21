/**
 * StartMenuScene.js — The main menu scene
 */
import Scene from "./Scene.js";

export class StartMenuScene extends Scene {
  constructor(stateManager, eventBus, uiManager, sceneLayer) {
    super(stateManager, eventBus, uiManager, sceneLayer);
  }

  async enter(params = {}) {
    this.params = params;
    
    // Set background
    this.uiManager.renderBackground("campus");
    
    // Render the main menu
    this._renderMenu();
  }

  _renderMenu() {
    const hasSaves = this.params.hasSaves || false;

    const buttons = [
      {
        text: "New Game",
        id: "new_game",
        action: "new_game",
        onClick: () => this._handleMenuAction("new_game")
      },
      {
        text: hasSaves ? "Continue" : "No Saves",
        id: "continue",
        action: "continue",
        disabled: !hasSaves,
        onClick: () => {
          if (hasSaves) this._handleMenuAction("continue");
        }
      },
      {
        text: "Quit",
        id: "quit",
        action: "quit",
        onClick: () => this._handleMenuAction("quit")
      }
    ];

    this.uiManager.renderMenu("After Class", buttons);
  }

  _handleMenuAction(action) {
    this.eventBus.emit("menu:action", { action });
  }

  exit() {
    super.exit();
  }
}

export default StartMenuScene;
