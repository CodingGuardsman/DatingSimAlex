import re

# ===== FIX 1: UIManager.js — Remove portrait centering =====
with open(r'c:\Users\admin\dating-sim\src\systems\UIManager.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1a: _setupContainers() - main slot: change alignItems from "center" to "flex-end"
# Line 94: slot.style.alignItems = "center";
old = '''      slot.style.display = "flex";
      slot.style.justifyContent = "center";
      slot.style.alignItems = "center";
      slot.style.pointerEvents = "none";'''
new = '''      slot.style.display = "flex";
      slot.style.justifyContent = "flex-end";
      slot.style.alignItems = "flex-end";
      slot.style.pointerEvents = "none";'''
if old in content:
    content = content.replace(old, new)
    print("FIX 1a: _setupContainers main slot centering removed")
else:
    print("ERROR 1a: pattern not found")

# Fix 1b: renderCharacterSprite() - change justifyContent from "center" to "flex-end"
old2 = '''    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "flex-end";'''
new2 = '''    container.style.display = "flex";
    container.style.justifyContent = "flex-end";
    container.style.alignItems = "flex-end";'''
if old2 in content:
    content = content.replace(old2, new2)
    print("FIX 1b: renderCharacterSprite centering removed")
else:
    print("ERROR 1b: pattern not found")

# Fix 1c: _createCharSlot() - change justifyContent from "center" to "flex-end"
old3 = '''    slot.style.display = "flex";
    slot.style.justifyContent = "center";
    slot.style.alignItems = "flex-end";'''
new3 = '''    slot.style.display = "flex";
    slot.style.justifyContent = "flex-end";
    slot.style.alignItems = "flex-end";'''
if old3 in content:
    content = content.replace(old3, new3)
    print("FIX 1c: _createCharSlot centering removed")
else:
    print("ERROR 1c: pattern not found")

with open(r'c:\Users\admin\dating-sim\src\systems\UIManager.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("UIManager.js done\n")

# ===== FIX 2: StateManager.js — Add getPlayerName() =====
with open(r'c:\Users\admin\dating-sim\src\engine\StateManager.js', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''  reset() {
    this.state = this.createDefaultState();
  }

  getFullState() {'''
new = '''  reset() {
    this.state = this.createDefaultState();
  }

  getPlayerName() {
    if (this.state.playerName && this.state.playerName !== "Alex") {
      return this.state.playerName;
    }
    try {
      const stored = localStorage.getItem('afterclass_player_name');
      if (stored) return stored;
    } catch(e) {}
    return "Alex";
  }

  getFullState() {'''
if old in content:
    content = content.replace(old, new)
    print("FIX 2: getPlayerName() added to StateManager")
else:
    print("ERROR 2: pattern not found")

with open(r'c:\Users\admin\dating-sim\src\engine\StateManager.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("StateManager.js done\n")

# ===== FIX 3: DialogueSystem.js — Use getPlayerName() =====
with open(r'c:\Users\admin\dating-sim\src\systems\DialogueSystem.js', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''  _processMetaVoice(text) {
    // Get player name from stateManager or localStorage
    let playerName = "Player";
    if (this.stateManager && this.stateManager.state && this.stateManager.state.playerName) {
      playerName = this.stateManager.state.playerName;
    } else {
      try {
        const stored = localStorage.getItem('afterclass_player_name');
        if (stored) playerName = stored;
      } catch(e) {}
    }'''
new = '''  _processMetaVoice(text) {
    // Get player name via StateManager.getPlayerName()
    let playerName = "Alex";
    if (this.stateManager && this.stateManager.getPlayerName) {
      playerName = this.stateManager.getPlayerName();
    }'''
if old in content:
    content = content.replace(old, new)
    print("FIX 3: _processMetaVoice uses getPlayerName()")
else:
    print("ERROR 3: pattern not found")

with open(r'c:\Users\admin\dating-sim\src\systems\DialogueSystem.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("DialogueSystem.js done")