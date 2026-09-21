/**
 * SaveSystem.js — Manages localStorage save/load with multiple save slots
 */
const SAVE_PREFIX = "level_up_campus_crush_save_";
const SLOT_KEY = "level_up_campus_crush_slot_count";
const METADATA_PREFIX = "level_up_campus_crush_meta_";

export class SaveSystem {
  constructor(stateManager, slotCount = 5) {
    this.stateManager = stateManager;
    this.slotCount = slotCount;
  }

  /**
   * Get the save key for a given slot (1-indexed).
   */
  getSaveKey(slot) {
    return `${SAVE_PREFIX}${slot}`;
  }

  getMetaKey(slot) {
    return `${METADATA_PREFIX}${slot}`;
  }

  /**
   * Save the current game state to a specific slot.
   * Returns true if successful.
   */
  saveToSlot(slot) {
    try {
      const saveData = this.stateManager.getSaveData();
      const metaData = {
        day: saveData.day,
        timeOfDay: saveData.timeOfDay,
        playTime: saveData.playTime,
        playerName: saveData.playerName,
        savedAt: Date.now(),
        version: "1.0.0"
      };
      
      localStorage.setItem(this.getSaveKey(slot), JSON.stringify(saveData));
      localStorage.setItem(this.getMetaKey(slot), JSON.stringify(metaData));
      
      return true;
    } catch (error) {
      console.error("Failed to save:", error);
      return false;
    }
  }

  /**
   * Load the game state from a specific slot.
   * Returns the loaded save data or null if slot is empty/corrupt.
   */
  loadFromSlot(slot) {
    try {
      const raw = localStorage.getItem(this.getSaveKey(slot));
      if (!raw) return null;
      
      const saveData = JSON.parse(raw);
      this.stateManager.loadSaveData(saveData);
      return saveData;
    } catch (error) {
      console.error(`Failed to load slot ${slot}:`, error);
      return null;
    }
  }

  /**
   * Get metadata for a save slot (without loading the full game state).
   */
  getSlotMetadata(slot) {
    try {
      const raw = localStorage.getItem(this.getMetaKey(slot));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Check if a save slot has data.
   */
  hasSave(slot) {
    return localStorage.getItem(this.getSaveKey(slot)) !== null;
  }

  /**
   * Delete a save from a specific slot.
   */
  deleteSlot(slot) {
    localStorage.removeItem(this.getSaveKey(slot));
    localStorage.removeItem(this.getMetaKey(slot));
  }

  /**
   * List all save slots with their metadata.
   */
  listSaves() {
    const saves = [];
    for (let i = 1; i <= this.slotCount; i++) {
      const meta = this.getSlotMetadata(i);
      if (meta) {
        saves.push({ slot: i, ...meta });
      }
    }
    return saves;
  }

  /**
   * Quick save to a dedicated quicksave slot.
   */
  quickSave() {
    return this.saveToSlot(0);
  }

  /**
   * Quick load from the quicksave slot.
   * Returns the loaded data or null.
   */
  quickLoad() {
    return this.loadFromSlot(0);
  }

  /**
   * Format a timestamp for display.
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  /**
   * Auto-save to a dedicated auto-save slot.
   */
  autoSave() {
    const result = this.saveToSlot(-1);
    if (result) {
      const meta = this.getSlotMetadata(-1);
      if (meta) meta.autoSave = true;
      localStorage.setItem(this.getMetaKey(-1), JSON.stringify(meta));
    }
    return result;
  }

  /**
   * Auto-load from the auto-save slot.
   */
  autoLoad() {
    const raw = localStorage.getItem(this.getSaveKey(-1));
    if (!raw) return null;
    try {
      const saveData = JSON.parse(raw);
      this.stateManager.loadSaveData(saveData);
      return saveData;
    } catch {
      return null;
    }
  }
}

export default SaveSystem;
