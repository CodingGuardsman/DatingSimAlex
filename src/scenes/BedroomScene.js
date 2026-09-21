/**
 * BedroomScene.js — Alex's dorm room (morning: activity selection)
 * 
 * This scene delegates dialogue to the DialogueSystem (owned by the Game).
 * It simply sets up the environment and signals when the player is ready.
 */
import Scene from "./Scene.js";
import { TIME_OF_DAY } from "../utils/constants.js";

export class BedroomScene extends Scene {
  constructor(stateManager, eventBus, uiManager, sceneLayer) {
    super(stateManager, eventBus, uiManager, sceneLayer);
    this.isReady = false;
  }

  async enter(params = {}) {
    this.isReady = false;
// Show Alex portrait during morning overlay
    this.uiManager.renderCharacterSprite("alex", "neutral", "right");
    this.params = params;

    // Render environment
    this.uiManager.renderBackground("bedroom");
    this.uiManager.renderLocationLabel("Your Dorm Room");
    this.uiManager.renderTimeDisplay();

    // Show wake-up overlay
    this.uiManager.showOverlay(
      "Morning light fills your dorm room.",
      "A new day is waiting..."
    );

    // Hide overlay after a brief moment, then signal Game to start dialogue
    setTimeout(() => {
      this.uiManager.hideOverlay();
      this.isReady = true;
      this.eventBus.emit("scene:ready", { scene: "bedroom" });
    }, 1500);

    // Track the last activity chosen (set by DialogueSystem when bedroom dialogue ends)
    // Default to campus_walk so CampusScene can determine the encounter
    this.stateManager.setFlag("lastActivity", "campus_walk");
  }

  update(deltaTime) {
    // Could add animations here
  }

  exit() {
    super.exit();
    this.isReady = false;
  }
}

export default BedroomScene;
