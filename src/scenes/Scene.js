/**
 * Scene.js — Base class for all game scenes
 * 
 * A Scene represents a major game state (main menu, location, dialogue, etc.).
 * Subclasses override enter(), exit(), update(), and handleEvent().
 */
export class Scene {
  constructor(stateManager, eventBus, uiManager, sceneLayer) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.uiManager = uiManager;
    this.sceneLayer = sceneLayer;
    this.entities = [];
  }

  /**
   * Called when the scene is entered. params is data passed from changeScene().
   */
  async enter(params = {}) {
    // Override in subclass
  }

  /**
   * Called when the scene is exited.
   */
  exit() {
    this._cleanupEntities();
    if (this.uiManager) {
      this.uiManager.clearUI();
    }
  }

  /**
   * Called every frame/tick.
   */
  update(deltaTime) {
    // Override in subclass
  }

  /**
   * Handle events forwarded from the SceneManager.
   */
  handleEvent(event, data) {
    return false;
  }

  /**
   * Called when dialogue starts (for scenes that support it).
   */
  startDialogue(dialogueId) {
    // Override in subclass if scene manages dialogue
  }

  /**
   * Clean up all DOM elements and state created by this scene.
   */
  _cleanupEntities() {
    this.entities.forEach(el => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    this.entities = [];
    // Clear scene layer
    while (this.sceneLayer.firstChild) {
      this.sceneLayer.removeChild(this.sceneLayer.firstChild);
    }
  }

  /**
   * Helper: create a DOM element with class and optional children.
   */
  _createElement(tag, className = "", textContent = "") {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    this.entities.push(el);
    return el;
  }

  /**
   * Clean up before destruction.
   */
  destroy() {
    this._cleanupEntities();
  }
}

export default Scene;

