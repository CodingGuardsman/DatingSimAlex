with open('src/systems/UIManager.js') as f:
    c = f.read()

# Fix 1: Center the overlay
old1 = '''    overlay.innerHTML = "";
    overlay.style.display = "block";

    const textEl = document.createElement("div");
    textEl.className = "scene-card-title";
    textEl.textContent = text;
    overlay.appendChild(textEl);'''

new1 = '''    overlay.innerHTML = "";
    overlay.style.display = "block";
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "10";
    overlay.style.background = "rgba(0,0,0,0.55)";
    overlay.style.backdropFilter = "blur(4px)";

    const textEl = document.createElement("div");
    textEl.className = "scene-card-title";
    textEl.textContent = text;
    textEl.style.textAlign = "center";
    textEl.style.color = "#fff";
    textEl.style.fontSize = "1.8rem";
    overlay.appendChild(textEl);'''

c = c.replace(old1, new1)

# Fix 2: Position the character portrait slot
old2 = '''    let slot = document.getElementById("character-sprite-slot");
    if (!slot) {
      slot = document.createElement("div");
      slot.id = "character-sprite-slot";
      this.sceneLayer.appendChild(slot);
    }'''

new2 = '''    let slot = document.getElementById("character-sprite-slot");
    if (!slot) {
      slot = document.createElement("div");
      slot.id = "character-sprite-slot";
      slot.style.position = "absolute";
      slot.style.right = "40px";
      slot.style.bottom = "120px";
      slot.style.zIndex = "3";
      slot.style.display = "flex";
      slot.style.justifyContent = "center";
      slot.style.alignItems = "center";
      this.sceneLayer.appendChild(slot);
    }'''

c = c.replace(old2, new2)

with open('src/systems/UIManager.js', 'w') as f:
    f.write(c)
print('Fixed!')