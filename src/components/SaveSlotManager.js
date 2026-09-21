/**
 * SaveSlotManager.js — Reusable component for rendering save slot selection UI
 */
export class SaveSlotManager {
  constructor(container) {
    this.container = container;
    this.onSelect = null;
  }

  render(slots, onSelect) {
    this.onSelect = onSelect;
    this.container.innerHTML = "";
    this.container.className = "save-slots";

    slots.forEach(slot => {
      const slotEl = document.createElement("div");
      slotEl.className = `save-slot ${slot.hasSave ? "" : "empty"}`;
      slotEl.dataset.slot = slot.number;

      const title = document.createElement("div");
      title.style.fontWeight = "bold";
      title.textContent = slot.label || `Slot ${slot.number}`;
      slotEl.appendChild(title);

      if (slot.hasSave && slot.meta) {
        const dayEl = document.createElement("div");
        dayEl.style.fontSize = "0.85rem";
        dayEl.style.color = "#a0a0b0";
        dayEl.textContent = `Day ${slot.meta.day} · ${slot.meta.timeOfDay}`;
        slotEl.appendChild(dayEl);

        const dateEl = document.createElement("div");
        dateEl.style.fontSize = "0.75rem";
        dateEl.style.color = "#808090";
        dateEl.textContent = new Date(slot.meta.savedAt).toLocaleDateString();
        slotEl.appendChild(dateEl);
      }

      slotEl.addEventListener("click", () => {
        if (this.onSelect) this.onSelect(slot.number);
      });
      this.container.appendChild(slotEl);
    });

    return this.container;
  }

  clear() {
    this.container.innerHTML = "";
  }
}

export default SaveSlotManager;
