/**
 * SceneManager.js — Manages scene lifecycle, registration, and transitions
 */
import { EVENTS } from "../utils/constants.js";

export class SceneManager {
  constructor(stateManager, eventBus, uiManager, sceneLayer) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.uiManager = uiManager;
    this.sceneLayer = sceneLayer;
    this.scenes = new Map();
    this.activeScene = null;
    this.activeSceneId = null;
  }

  /**
   * Register a scene class or instance.
   * @param {string} id - Scene identifier
   * @param {Function|Object} scene - Scene class or instance
   */
  registerScene(id, scene) {
    this.scenes.set(id, scene);
  }

  /**
   * Get a scene instance (instantiates if it's a class).
   */
  _getSceneInstance(id) {
    const registered = this.scenes.get(id);
    if (!registered) {
      console.warn(`Scene not registered: ${id}`);
      return null;
    }
    if (typeof registered === "function") {
      // It's a class — instantiate
      const instance = new registered(this.stateManager, this.eventBus, this.uiManager, this.sceneLayer);
      this.scenes.set(id, instance);
      return instance;
    }
    return registered;
  }

  /**
   * Transition to a new scene.
   */
  async changeScene(sceneId, transition = "fade", params = {}) {
    const newScene = this._getSceneInstance(sceneId);
    if (!newScene) return false;

    const oldScene = this.activeScene;
    
    // Exit old scene
    if (oldScene && typeof oldScene.exit === "function") {
      oldScene.exit();
    }
    
    this.stateManager.setScene(sceneId);
    this.eventBus.emit(EVENTS.SCENE_EXIT, { sceneId: this.activeSceneId });
    
    // Transition
    if (transition === "fade" && oldScene) {
      await this._fadeTransition();
    }
    
    this.activeSceneId = sceneId;
    this.activeScene = newScene;
    
    // Enter new scene
    if (typeof newScene.enter === "function") {
      await newScene.enter(params);
    }
    
    this.eventBus.emit(EVENTS.SCENE_ENTER, { sceneId, params });
    return true;
  }

  /**
   * Immediate scene switch without transition.
   */
  async switchScene(sceneId, params = {}) {
    return this.changeScene(sceneId, "none", params);
  }

  async _fadeTransition() {
    const overlay = document.createElement("div");
    overlay.style.cssText = [
      "position: absolute", "top: 0", "left: 0", "width: 100%", "height: 100%",
      "background: #000", "opacity: 1", "pointer-events: none",
      "transition: opacity 0.3s ease", "z-index: 998"
    ].join(";");
    this.sceneLayer.appendChild(overlay);
    overlay.style.opacity = "0";
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 350);
  }

  /**
   * Get the active scene.
   */
  getActiveScene() {
    return this.activeScene;
  }

  /**
   * Get the active scene ID.
   */
  getActiveSceneId() {
    return this.activeSceneId;
  }

  /**
   * Update the active scene (called each frame or tick).
   */
  update(deltaTime) {
    if (this.activeScene && typeof this.activeScene.update === "function") {
      this.activeScene.update(deltaTime);
    }
  }

  /**
   * Forward an event to the active scene.
   */
  handleEvent(event, data) {
    if (this.activeScene && typeof this.activeScene.handleEvent === "function") {
      return this.activeScene.handleEvent(event, data);
    }
    return false;
  }

  /**
   * Clean up all scenes.
   */
  destroy() {
    if (this.activeScene && typeof this.activeScene.destroy === "function") {
      this.activeScene.destroy();
    }
    this.scenes.clear();
    this.activeScene = null;
    this.activeSceneId = null;
  }
}

export default SceneManager;
