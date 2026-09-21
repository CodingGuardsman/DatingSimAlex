/**
 * RelationshipSystem.js — Manages relationship values with characters
 */
import { EVENTS, ROMANCEABLE_IDS } from "../utils/constants.js";

export class RelationshipSystem {
  constructor(stateManager, eventBus) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
  }

  /**
   * Modify relationship with a character by a delta.
   */
  modifyRelationship(charId, delta) {
    this.stateManager.modifyRelationship(charId, delta);
  }

  /**
   * Get relationship value (0-100).
   */
  getRelationship(charId) {
    return this.stateManager.getRelationship(charId);
  }

  /**
   * Get relationship tier for a character.
   * Returns: "stranger", "acquaintance", "friend", "close", "crush", "love"
   */
  getRelationshipTier(charId) {
    const value = this.getRelationship(charId);
    if (value < 10) return "stranger";
    if (value < 30) return "acquaintance";
    if (value < 50) return "friend";
    if (value < 70) return "close";
    if (value < 90) return "crush";
    return "love";
  }

  /**
   * Check if the relationship meets a threshold.
   */
  meetsThreshold(charId, minValue) {
    return this.getRelationship(charId) >= minValue;
  }

  /**
   * Check multiple relationship requirements.
   * requirements = { "maya": 50, "emma": 60 }
   */
  checkRequirements(requirements) {
    if (!requirements) return null;
    for (const [charId, min] of Object.entries(requirements)) {
      if (this.getRelationship(charId) < min) return charId;
    }
    return null;
  }

  /**
   * Apply relationship effects from a choice/encounter.
   */
  applyRelationshipEffects(effects) {
    if (!effects) return [];
    const changes = [];
    for (const charId of ROMANCEABLE_IDS) {
      if (effects[`relationship_${charId}`] !== undefined) {
        const delta = effects[`relationship_${charId}`];
        this.modifyRelationship(charId, delta);
        changes.push({ character: charId, delta });
      }
    }
    return changes;
  }

  /**
   * Get all relationships for display.
   */
  getAllRelationships() {
    const rels = {};
    for (const charId of ROMANCEABLE_IDS) {
      rels[charId] = this.getRelationship(charId);
    }
    return rels;
  }

  /**
   * Returns the list of romanceable characters sorted by relationship value.
   */
  getSortedCharacters() {
    return ROMANCEABLE_IDS
      .map(id => ({ id, value: this.getRelationship(id) }))
      .sort((a, b) => b.value - a.value);
  }
}

export default RelationshipSystem;
