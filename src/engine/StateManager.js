/**
 * StateManager.js — Manages the single source of truth for game state
 */
import { EVENTS, STAT_NAMES, MIN_STAT, MAX_STAT, SAVE_SLOT_COUNT, TIME_OF_DAY } from "../utils/constants.js";
import { deepClone, clampStat } from "../utils/helpers.js";

export class StateManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.state = this.createDefaultState();
  }

  createDefaultState() {
    return {
      // Core progression
      day: 1,
      timeOfDay: TIME_OF_DAY.MORNING,
      playTime: 0,

      // Stats (0-100)
      stats: {
        confidence: 20,
        intelligence: 25,
        fitness: 15,
        charm: 10,
        social: 18,
        money: 50
      },

      // Relationships (0-100) — keyed by character ID
      relationships: {
        maya: 30,
        chloe: 20,
        hana: 15,
        riley: 20,
        emma: 70
      },

      // Permanent story flags
      flags: {},

      // Inventory / items (for future expansion)
      inventory: [],

      // Current location
      location: "bedroom",

      // Active scene / dialogue context
      currentSceneId: null,
      currentDialogueId: null,

      // Player name
      playerName: "Alex"
    };
  }

  getStat(statName) {
    return this.state.stats[statName] ?? 0;
  }

  modifyStat(statName, delta) {
    const oldValue = this.state.stats[statName];
    this.state.stats[statName] = clampStat(oldValue + delta);
    this.eventBus.emit(EVENTS.STAT_CHANGE, {
      stat: statName,
      oldValue,
      newValue: this.state.stats[statName],
      delta
    });
  }

  setStat(statName, value) {
    const delta = value - this.state.stats[statName];
    this.modifyStat(statName, delta);
  }

  modifyStats(deltas) {
    for (const [stat, delta] of Object.entries(deltas)) {
      this.modifyStat(stat, delta);
    }
  }

  getRelationship(charId) {
    return this.state.relationships[charId] ?? 0;
  }

  modifyRelationship(charId, delta) {
    const oldValue = this.state.relationships[charId] ?? 0;
    this.state.relationships[charId] = clampStat(oldValue + delta);
    this.eventBus.emit(EVENTS.RELATIONSHIP_CHANGE, {
      character: charId,
      oldValue,
      newValue: this.state.relationships[charId],
      delta
    });
  }

  setFlag(flagName, value = true) {
    this.state.flags[flagName] = value;
  }

  getFlag(flagName) {
    return this.state.flags[flagName] ?? false;
  }

  hasFlag(flagName) {
    return flagName in this.state.flags && this.state.flags[flagName] !== false;
  }

  setTimeOfDay(timeOfDay) {
    this.state.timeOfDay = timeOfDay;
    this.eventBus.emit(EVENTS.TIME_CHANGE, { timeOfDay, day: this.state.day });
  }

  advanceTime() {
    const order = [TIME_OF_DAY.MORNING, TIME_OF_DAY.AFTERNOON, TIME_OF_DAY.EVENING, TIME_OF_DAY.NIGHT];
    const currentIndex = order.indexOf(this.state.timeOfDay);
    if (currentIndex < order.length - 1) {
      this.setTimeOfDay(order[currentIndex + 1]);
      return true;
    }
    // End of day reached
    return false;
  }

  advanceDay() {
    this.state.day += 1;
    this.state.timeOfDay = TIME_OF_DAY.MORNING;
    this.eventBus.emit(EVENTS.DAY_START, { day: this.state.day });
  }

  setLocation(locationId) {
    this.state.location = locationId;
  }

  setScene(sceneId) {
    this.state.currentSceneId = sceneId;
  }

  setDialogue(dialogueId) {
    this.state.currentDialogueId = dialogueId;
  }

  getSaveData() {
    return deepClone(this.state);
  }

  loadSaveData(data) {
    this.state = deepClone(data);
    this.eventBus.emit(EVENTS.GAME_LOAD, { state: this.state });
  }

  reset() {
    this.state = this.createDefaultState();
  }

  getPlayerName() {
    if (this.state.playerName && this.state.playerName !== "Alex") {
      return this.state.playerName;
    }
    try {
      const stored = localStorage.getItem('afterclass_player_name');
      if (stored) return stored;
    } catch(e) {}
    return "Alex";
  }

  getFullState() {
    return deepClone(this.state);
  }
}

export default StateManager;
