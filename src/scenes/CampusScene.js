/**
 * CampusScene.js — The campus hub where the player encounters characters.
 *
 * Encounter selection is activity-driven: the morning activity choice
 * determines which character you run into on campus.
 */
import Scene from "./Scene.js";

// Encounter triggers based on morning activity choice
const ENCOUNTER_MAP = {
  library_investigation: { characterId: "maya", dialogueId: "campus_walk" },
  campus_walk: { characterId: "chloe", dialogueId: "campus_walk" },
  visit_maya_lab: { characterId: "maya", dialogueId: "visit_maya_lab" },
  visit_chloe_office: { characterId: "chloe", dialogueId: "visit_chloe_office" },
  visit_hana_studio: { characterId: "hana", dialogueId: "visit_hana_studio" },
  examine_note: { characterId: "maya", dialogueId: "campus_walk" },
  confrontation_preparation: { characterId: "chloe", dialogueId: "confrontation_preparation" }
};

// Location hints for each character
const CHARACTER_LOCATIONS = {
  maya:  { location: "computer lab", hobby: "coding club meeting" },
  chloe: { location: "student union", hobby: "organizing a campaign" },
  hana:  { location: "art building courtyard", hobby: "sketching" }
};

export class CampusScene extends Scene {
  constructor(stateManager, eventBus, uiManager, sceneLayer) {
    super(stateManager, eventBus, uiManager, sceneLayer);
    this.encounterTriggered = false;
  }

  async enter(params = {}) {
    this.encounterTriggered = false;
    this.params = params;

    // Render environment
    this.uiManager.renderBackground("campus");
    this.uiManager.renderLocationLabel("University Campus");
    this.uiManager.renderTimeDisplay();

    // Select and display the encounter character
    this.encounter = this._selectEncounter();
    this.uiManager.renderCharacterSprite(
      this.encounter.characterId,
      "neutral",
      "right"
    );

    // Show intro overlay with character flavor
    const char = this.encounter.characterId;
    const flavor = CHARACTER_LOCATIONS[char];
    this.uiManager.showOverlay(
      "It's a beautiful afternoon on campus.",
      `As you walk near the ${flavor.location}, you spot ${char.charAt(0).toUpperCase() + char.slice(1)}...`
    );

    // Schedule encounter after overlay fade
    setTimeout(() => {
      this.uiManager.hideOverlay();
      this._triggerEncounter();
    }, 2000);
  }

  _selectEncounter() {
    const state = this.stateManager.state;
    const flags = state.flags || {};
    const lastActivity = state.lastActivity || "campus_walk";

    // Use the activity-driven encounter map
    const encounter = ENCOUNTER_MAP[lastActivity];
    if (encounter) {
      return {
        characterId: encounter.characterId,
        dialogueId: encounter.dialogueId,
        isFirst: !flags["met_" + encounter.characterId]
      };
    }

    // Fallback: default to campus_walk
    return {
      characterId: "chloe",
      dialogueId: "campus_walk",
      isFirst: !flags["met_chloe"]
    };
  }

  _triggerEncounter() {
    if (this.encounterTriggered) return;
    this.encounterTriggered = true;

    this.eventBus.emit("encounter:start", {
      characterId: this.encounter.characterId,
      dialogueId: this.encounter.dialogueId
    });
  }

  update(deltaTime) {
    // Could add ambient animations here
  }

  exit() {
    super.exit();
    this.encounterTriggered = false;
    this.encounter = null;
  }
}

export default CampusScene;