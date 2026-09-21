/**
 * ChoiceMenu.js — Reusable choice menu component for dialogue options
 */
export class ChoiceMenu {
  constructor(container) {
    this.container = container;
    this.onSelect = null;
  }

  render(choices, onSelect) {
    this.onSelect = onSelect;
    this.container.innerHTML = "";

    if (!choices || choices.length === 0) return;

    choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.textContent = choice.text;
      button.className = "choice-btn";
      button.dataset.index = index;
      button.addEventListener("click", () => {
        if (this.onSelect) this.onSelect(index, choice);
      });
      this.container.appendChild(button);
    });
  }

  showContinue(onContinue) {
    this.container.innerHTML = "";
    const button = document.createElement("button");
    button.textContent = "Continue";
    button.className = "choice-btn";
    button.addEventListener("click", onContinue);
    this.container.appendChild(button);
  }

  clear() {
    this.container.innerHTML = "";
  }
}

export default ChoiceMenu;
