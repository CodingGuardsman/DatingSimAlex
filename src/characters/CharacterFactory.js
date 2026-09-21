/**
 * CharacterFactory.js — Creates character instances from JSON data definitions
 */
import Character from "./Character.js";
import Alex from "./alex.js";
import Maya from "./maya.js";
import Chloe from "./chloe.js";
import Hana from "./hana.js";

// Registry of class constructors keyed by character ID
const CHARACTER_REGISTRY = {
  alex: Alex,
  maya: Maya,
  chloe: Chloe,
  hana: Hana,
};

export class CharacterFactory {
  static createFromClass(charId) {
    const ClassConstructor = CHARACTER_REGISTRY[charId];
    if (ClassConstructor) {
      return new ClassConstructor();
    }
    return null;
  }

  static createFromData(data) {
    if (!data || !data.id) return null;
    const ClassConstructor = CHARACTER_REGISTRY[data.id];
    if (ClassConstructor) {
      return new ClassConstructor();
    }
    // Fall back to generic Character
    return new Character(data);
  }

  static createFromJSON(jsonData) {
    const characters = {};
    for (const [id, data] of Object.entries(jsonData)) {
      characters[id] = this.createFromData(data);
    }
    return characters;
  }

  static getRegisteredIds() {
    return Object.keys(CHARACTER_REGISTRY);
  }

  static isRegistered(charId) {
    return charId in CHARACTER_REGISTRY;
  }

  static registerCharacter(charId, classConstructor) {
    CHARACTER_REGISTRY[charId] = classConstructor;
  }
}

export default CharacterFactory;
