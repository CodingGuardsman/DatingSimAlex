/**
 * constants.js — Game-wide constants
 */
export const STAT_NAMES = ["confidence", "intelligence", "fitness", "charm", "social", "money"];

export const STAT_LABELS = {
  confidence: "Confidence",
  intelligence: "Intelligence",
  fitness: "Fitness",
  charm: "Charm",
  social: "Social",
  money: "Money"
};

export const STAT_COLORS = {
  confidence: "var(--color-stat-1)",
  intelligence: "var(--color-stat-2)",
  fitness: "var(--color-stat-3)",
  charm: "var(--color-stat-4)",
  social: "var(--color-stat-5)",
  money: "var(--color-stat-6)"
};

export const TIME_OF_DAY = {
  MORNING: "morning",
  AFTERNOON: "afternoon",
  EVENING: "evening",
  NIGHT: "night"
};

export const SAVE_SLOT_COUNT = 5;
export const MIN_STAT = 0;
export const MAX_STAT = 100;

export const CHARACTER_IDS = ["alex", "maya", "chloe", "hana"];
export const ROMANCEABLE_IDS = ["maya", "chloe", "hana"];

export const EVENTS = {
  GAME_START: "game:start",
  GAME_LOAD: "game:load",
  DAY_START: "day:start",
  DAY_END: "day:end",
  TIME_CHANGE: "time:change",
  STAT_CHANGE: "stat:change",
  RELATIONSHIP_CHANGE: "relationship:change",
  DIALOGUE_START: "dialogue:start",
  DIALOGUE_ADVANCE: "dialogue:advance",
  DIALOGUE_CONTINUE: "dialogue:continue",
  DIALOGUE_END: "dialogue:end",
  SCENE_CHANGE: "scene:change",
  SCENE_ENTER: "scene:enter",
  SCENE_EXIT: "scene:exit",
  SAVE_GAME: "save:game",
  LOAD_GAME: "load:game",
  CHOICE_MADE: "choice:made",
  CHOICE_SELECTED: "choice:selected",
  ACTIVITY_DONE: "activity:done",
  ENCOUNTER_START: "encounter:start",
  ENCOUNTER_COMPLETE: "encounter:complete",
  MENU_ACTION: "menu:action",
  END_OF_DAY_CONTINUE: "end_of_day:continue"
};
