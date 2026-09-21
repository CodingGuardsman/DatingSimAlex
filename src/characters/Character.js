/**
 * Character.js — Base class for all characters
 * Each character can be extended with custom behavior, expressions, and dialogue triggers.
 */
export class Character {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.age = data.age;
    this.major = data.major;
    this.personality = data.personality || "";
    this.bio = data.bio || "";
    this.romanceable = data.romanceable || false;
    this.expressions = data.expressions || ["neutral"];
    this.defaultExpression = data.defaultExpression || "neutral";
    this.color = data.color || "#888";
    this.spritePath = data.spritePath || `assets/images/characters/${this.id}`;
  }

  /**
   * Get the full sprite path for a given expression.
   */
  getSpritePath(expression = this.defaultExpression) {
    return `${this.spritePath}/${expression}.png`;
  }

  /**
   * Get all available expressions.
   */
  getExpressions() {
    return this.expressions;
  }

  /**
   * Check if this character has a specific expression.
   */
  hasExpression(expression) {
    return this.expressions.includes(expression);
  }

  /**
   * Hook called when an encounter with this character begins.
   * Can be overridden in subclasses.
   */
  onEncounter(game) {
    // Default: no special behavior
  }

  /**
   * Hook called when player makes a dialogue choice during an encounter.
   */
  onChoiceSelected(game, choice) {
    // Default: no special behavior
  }

  /**
   * Get dialogue lines that this character can trigger.
   * Can be overridden to provide dynamic dialogue.
   */
  getEncounterDialogue(game) {
    return `${this.id}_encounter`;
  }

  /**
   * Serialize to JSON for save/load.
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      major: this.major,
      personality: this.personality,
      bio: this.bio,
      romanceable: this.romanceable,
      expressions: this.expressions,
      defaultExpression: this.defaultExpression,
      color: this.color,
      spritePath: this.spritePath
    };
  }

  static fromJSON(data) {
    return new Character(data);
  }
}

export default Character;
