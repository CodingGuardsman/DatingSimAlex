/**
 * DialogueBox.js — Reusable dialogue box component
 * Renders speaker name, dialogue text, and a continue prompt.
 */
export class DialogueBox {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.speakerEl = null;
    this.textEl = null;
    this._render();
  }

  _render() {
    this.container.innerHTML = "";
    this.element = document.createElement("div");
    this.element.className = "dialogue-box";

    this.speakerEl = document.createElement("div");
    this.speakerEl.className = "dialogue-speaker";
    this.element.appendChild(this.speakerEl);

    this.textEl = document.createElement("div");
    this.textEl.className = "dialogue-text";
    this.element.appendChild(this.textEl);

    this.choicesEl = document.createElement("div");
    this.choicesEl.className = "dialogue-choices";
    this.element.appendChild(this.choicesEl);

    this.container.appendChild(this.element);
  }

  setSpeaker(name) {
    this.speakerEl.textContent = name || "";
    this.speakerEl.style.display = name ? "block" : "none";
  }

  setText(text) {
    this.textEl.textContent = text || "";
  }

  showChoices(choices, onChoice) {
    this.choicesEl.innerHTML = "";
    if (choices && choices.length > 0) {
      choices.forEach((choice, index) => {
        const btn = document.createElement("button");
        btn.textContent = choice.text;
        btn.addEventListener("click", () => onChoice(index, choice));
        this.choicesEl.appendChild(btn);
      });
      this.choicesEl.style.display = "flex";
    }
  }

  showContinue(onContinue) {
    this.choicesEl.innerHTML = "";
    const btn = document.createElement("button");
    btn.textContent = "?";
    btn.title = "Continue";
    btn.style.maxWidth = "60px";
    btn.addEventListener("click", onContinue);
    this.choicesEl.appendChild(btn);
    this.choicesEl.style.display = "flex";
  }

  hide() {
    if (this.element) this.element.style.display = "none";
  }

  show() {
    if (this.element) this.element.style.display = "flex";
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default DialogueBox;
