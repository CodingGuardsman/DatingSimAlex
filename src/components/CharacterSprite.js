/**
 * CharacterSprite.js — Reusable component for rendering character expressions
 * Falls back to placeholder art when real sprites are not available.
 */
export class CharacterSprite {
  constructor(container) {
    this.container = container;
    this.currentCharId = null;
    this.currentExpression = "neutral";
    this.position = "right";
  }

  render(charId, expression = "neutral", position = "right") {
    this.currentCharId = charId;
    this.currentExpression = expression;
    this.position = position;
    this.container.innerHTML = "";
    this.container.id = "character-sprite-slot";

    const pixelCharacters = {
      alex: "farmer",
      maya: "librarian",
      chloe: "cook",
      hana: "gardener",
      riley: "farmer",
      emma: "librarian"
    };
    const pixelCharacter = pixelCharacters[charId];
    const imgPath = pixelCharacter
      ? `assets/images/itch-cozy/cozy/${pixelCharacter}_1.png`
      : `assets/images/characters/${charId}/${expression}.png`;
    const label = `${this._getCharacterName(charId)} (${expression})`;
    const bgColor = this._getCharacterColor(charId);
    
    const img = new Image();
    img.onload = () => {
      this.container.innerHTML = "";
      img.alt = label;
      img.className = "character-sprite";
      if (position === "left") img.style.float = "left";
      this.container.appendChild(img);
    };
    img.onerror = () => {
      this.container.innerHTML = "";
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder-asset";
      placeholder.style.minHeight = "300px";
      placeholder.style.width = "100%";
      placeholder.style.maxWidth = position === "left" ? "35%" : "35%";
      placeholder.style.backgroundColor = bgColor;
      placeholder.style.color = "#fff";
      placeholder.style.fontSize = "0.9rem";
      placeholder.style.float = position === "left" ? "left" : "right";
      placeholder.textContent = label;
      this.container.appendChild(placeholder);
    };
    img.src = imgPath;
  }

  clear() {
    this.container.innerHTML = "";
    this.currentCharId = null;
  }

  _getCharacterName(charId) {
    const names = {
      alex: "Alex", maya: "Maya", chloe: "Chloe",
      hana: "Hana", riley: "Riley", emma: "Emma"
    };
    return names[charId] || charId;
  }

  _getCharacterColor(charId) {
    const colors = {
      alex: "#4a90d9", maya: "#7b4aea", chloe: "#e94560",
      hana: "#52b4a9", riley: "#ffb74d", emma: "#ce93d8"
    };
    return colors[charId] || "#555";
  }
}

export default CharacterSprite;
