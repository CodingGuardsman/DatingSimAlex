/**
 * Menu.js — Generic reusable menu component
 * Handles a title and a set of buttons.
 */
export class Menu {
  constructor(container) {
    this.container = container;
    this.onSelect = null;
  }

  render(title, buttons, onSelect) {
    this.onSelect = onSelect;
    this.container.innerHTML = "";
    this.container.className = "menu";

    const titleEl = document.createElement("h1");
    titleEl.textContent = title;
    this.container.appendChild(titleEl);

    buttons.forEach(btn => {
      const button = document.createElement("button");
      button.textContent = btn.text;
      button.className = btn.className || "";
      if (btn.disabled) button.disabled = true;
      if (btn.id) button.id = btn.id;
      if (btn.data) {
        for (const [k, v] of Object.entries(btn.data)) {
          button.dataset[k] = v;
        }
      }
      button.addEventListener("click", (e) => {
        e.preventDefault();
        if (this.onSelect) this.onSelect(btn.id || btn.action, btn);
      });
      this.container.appendChild(button);
    });

    return this.container;
  }

  clear() {
    this.container.innerHTML = "";
  }
}

export default Menu;
