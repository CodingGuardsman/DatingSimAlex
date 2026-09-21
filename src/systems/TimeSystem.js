/**
 * TimeSystem.js — Manages the day/time progression and time-based events
 */
import { EVENTS, TIME_OF_DAY } from "../utils/constants.js";
import { formatTimeString } from "../utils/helpers.js";

export class TimeSystem {
  constructor(stateManager, eventBus) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.timeOrder = [
      TIME_OF_DAY.MORNING,
      TIME_OF_DAY.AFTERNOON,
      TIME_OF_DAY.EVENING,
      TIME_OF_DAY.NIGHT
    ];
    this.timeLabels = {
      [TIME_OF_DAY.MORNING]: "Morning",
      [TIME_OF_DAY.AFTERNOON]: "Afternoon",
      [TIME_OF_DAY.EVENING]: "Evening",
      [TIME_OF_DAY.NIGHT]: "Night"
    };
  }

  getCurrentTimeOfDay() {
    return this.stateManager.state.timeOfDay;
  }

  getCurrentLabel() {
    return this.timeLabels[this.stateManager.state.timeOfDay] || "Unknown";
  }

  /**
   * Advance time to the next period.
   * Returns true if time advanced, false if end of day reached.
   */
  advanceTime() {
    return this.stateManager.advanceTime();
  }

  /**
   * Advance to a specific time of day (if it hasn't passed yet).
   */
  advanceTo(timeOfDay) {
    const targetIndex = this.timeOrder.indexOf(timeOfDay);
    const currentIndex = this.timeOrder.indexOf(this.stateManager.state.timeOfDay);
    if (targetIndex > currentIndex) {
      this.stateManager.setTimeOfDay(timeOfDay);
      return true;
    }
    return false;
  }

  /**
   * End the current day and start a new one.
   */
  endDay() {
    this.eventBus.emit(EVENTS.DAY_END, { day: this.stateManager.state.day });
    this.stateManager.advanceDay();
    this.eventBus.emit(EVENTS.DAY_START, { day: this.stateManager.state.day });
  }

  /**
   * Start a new day (day 1 for a new game).
   */
  startNewDay() {
    this.stateManager.state.day = 1;
    this.stateManager.state.timeOfDay = TIME_OF_DAY.MORNING;
    this.stateManager.state.playTime = 0;
    this.eventBus.emit(EVENTS.DAY_START, { day: 1 });
  }

  getFormattedTime() {
    return formatTimeString(
      this.stateManager.state.day,
      this.timeLabels[this.stateManager.state.timeOfDay] || this.stateManager.state.timeOfDay
    );
  }

  /**
   * Get all available activities for the current time period.
   * This is data-driven — can be extended via the activities data.
   */
  getAvailableActivities() {
    const activities = this.stateManager.state.availableActivities || 
      (window.__GAME_DATA__ && window.__GAME_DATA__.activities) || 
      [];
    
    const currentTOD = this.stateManager.state.timeOfDay;
    return activities.filter(act => {
      if (act.availableTimes && !act.availableTimes.includes(currentTOD)) return false;
      if (act.requiredStats) {
        for (const [stat, min] of Object.entries(act.requiredStats)) {
          if (this.stateManager.getStat(stat) < min) return false;
        }
      }
      return true;
    });
  }
}

export default TimeSystem;
