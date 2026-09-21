/**
 * helpers.js — Generic utility functions
 */
import { MIN_STAT, MAX_STAT } from "./constants.js";

export function clamp(value, min = -Infinity, max = Infinity) {
  return Math.max(min, Math.min(max, value));
}

export function clampStat(value) {
  return clamp(value, MIN_STAT, MAX_STAT);
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function weightedRandom(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(deepClone);
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

export function formatTimeString(day, timeOfDay) {
  return `Day ${day} — ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}`;
}

export function throttle(fn, delay) {
  let timeoutId;
  let lastExecTime = 0;
  return function (...args) {
    const currentTime = Date.now();
    const timeSinceLastExec = currentTime - lastExecTime;
    if (timeSinceLastExec > delay) {
      lastExecTime = currentTime;
      fn.apply(this, args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastExecTime = Date.now();
        fn.apply(this, args);
      }, delay - timeSinceLastExec);
    }
  };
}

export function formatStatDelta(delta) {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}
