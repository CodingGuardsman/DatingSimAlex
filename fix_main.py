with open('src/main.js') as f:
    c = f.read()

# Fix 1: Remove daily save prompt - auto-save and advance
old = '''  _handleEndOfDayContinue() {
    console.log("[Game] End of day continue \u2014 showing save menu");

    // Show save slot selection
    const slots = this._buildSlotList();

    this.uiManager.renderSaveMenu(
      slots,
      (slotNumber) => {
        // Save and advance to next day
        this.saveSystem.saveToSlot(slotNumber);
        this.currentSaveSlot = slotNumber;
        this._advanceToNextDay();
      },
      () => {
        // Skip save, just advance
        this._advanceToNextDay();
      }
    );
  }'''

new = '''  _handleEndOfDayContinue() {
    console.log("[Game] End of day continue \u2014 advancing to next day");
    // Auto-save to current slot or slot 1, then advance
    if (this.currentSaveSlot) {
      this.saveSystem.saveToSlot(this.currentSaveSlot);
    } else {
      this.saveSystem.saveToSlot(1);
      this.currentSaveSlot = 1;
    }
    this._advanceToNextDay();
  }'''

c = c.replace(old, new)

# Fix 2: Update all references to old game name
c = c.replace('Level Up: Campus Crush', 'After Class')
c = c.replace('Thanks for playing Level Up: Campus Crush!', 'Thanks for playing After Class!')

with open('src/main.js', 'w') as f:
    f.write(c)
print('main.js updated')