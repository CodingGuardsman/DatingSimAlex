/**
 * maya.js — Maya, the sarcastic Computer Science student
 */
import Character from "./Character.js";

export class Maya extends Character {
  constructor() {
    super({
      id: "maya",
      name: "Maya",
      age: 20,
      major: "Computer Science",
      personality: "Intelligent, sarcastic, passionate about code and anime",
      bio: "A brilliant CS student who hides her caring nature behind dry wit and sarcasm.",
      romanceable: true,
      expressions: ["neutral", "smirk", "happy", "blush", "annoyed"],
      defaultExpression: "neutral",
      color: "#7b4aea"
    });
  }

  onEncounter(game) {
    // Maya's encounter is data-driven via dialogue ID
  }

  getEncounterDialogue(game) {
    const state = game.stateManager.state;
    // Different dialogue if player has met her before
    if (state.flags.met_maya) {
      return "campus_maya_recurring";
    }
    return "campus_maya_first";
  }
}

export default Maya;
