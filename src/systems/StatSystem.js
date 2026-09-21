/**
 * StatSystem.js — Wraps stat operations with game logic
 */
import { EVENTS, STAT_NAMES } from "../utils/constants.js";

export class StatSystem {
  constructor(stateManager, eventBus) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
  }

  /**
   * Apply a delta to a stat.
   */
  modifyStat(statName, delta) {
    if (!STAT_NAMES.includes(statName)) {
      console.warn(`Unknown stat: ${statName}`);
      return;
    }
    this.stateManager.modifyStat(statName, delta);
  }

  /**
   * Apply multiple stat deltas at once.
   */
  modifyStats(deltas) {
    this.stateManager.modifyStats(deltas);
  }

  /**
   * Check if a stat meets a minimum threshold.
   */
  meetsThreshold(statName, minValue) {
    return this.stateManager.getStat(statName) >= minValue;
  }

  /**
   * Check multiple stat thresholds. Returns first failing stat or null.
   */
  checkRequirements(requirements) {
    if (!requirements) return null;
    for (const [stat, min] of Object.entries(requirements)) {
      if (this.stateManager.getStat(stat) < min) return stat;
    }
    return null;
  }

  /**
   * Get a summary of all current stats for display.
   */
  getAllStats() {
    const stats = {};
    for (const name of STAT_NAMES) {
      stats[name] = this.stateManager.getStat(name);
    }
    return stats;
  }

  /**
   * Apply a stat effect from a choice/activity.
   * Supports both direct deltas and conditional effects.
   */
  applyStatEffects(effects) {
    if (!effects) return [];
    const changes = [];
    
    // Direct stat deltas
    for (const stat of STAT_NAMES) {
      if (effects[`stat_${stat}`] !== undefined) {
        const delta = effects[`stat_${stat}`];
        this.modifyStat(stat, delta);
        changes.push({ stat, delta });
      }
    }
    
    return changes;
  }
}

export default StatSystem;
