/**
 * StatDisplay.js — Reusable stat display component
 * Renders stat bars with labels, values, and colored progress bars.
 */
import { STAT_NAMES, STAT_LABELS, STAT_COLORS } from "../utils/constants.js";

export class StatDisplay {
  constructor(container) {
    this.container = container;
    this.onChangeCallbacks = [];
  }

  render() {
    this.container.innerHTML = "";
    this.container.className = "stat-display";

    STAT_NAMES.forEach(stat => {
      const row = this._createStatBar(stat, 0);
      this.container.appendChild(row);
    });
  }

  update(stats) {
    // Re-render efficiently
    const existingBars = this.container.querySelectorAll(".stat-bar");
    let i = 0;
    STAT_NAMES.forEach(stat => {
      const value = stats[stat] ?? 0;
      let row = existingBars[i];
      if (!row) {
        row = this._createStatBar(stat, value);
        this.container.appendChild(row);
      } else {
        this._updateStatBar(row, stat, value);
      }
      i++;
    });
  }

  _createStatBar(stat, value) {
    const row = document.createElement("div");
    row.className = "stat-bar";
    row.dataset.stat = stat;
    this._updateStatBar(row, stat, value);
    return row;
  }

  _updateStatBar(row, stat, value) {
    row.innerHTML = "";

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = STAT_LABELS[stat] || stat;
    row.appendChild(label);

    const valueEl = document.createElement("span");
    valueEl.className = "value";
    valueEl.textContent = String(value);
    row.appendChild(valueEl);

    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${value}%`;
    fill.style.backgroundColor = STAT_COLORS[stat] || "#888";
    bar.appendChild(fill);
    row.appendChild(bar);
  }

  onChange(callback) {
    this.onChangeCallbacks.push(callback);
    return () => {
      this.onChangeCallbacks = this.onChangeCallbacks.filter(cb => cb !== callback);
    };
  }
}

export default StatDisplay;
