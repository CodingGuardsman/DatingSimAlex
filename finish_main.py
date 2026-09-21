with open('src/main.js') as f:
    c = f.read()

rest = """
  _bindGameEvents() {
    this.eventBus.subscribe(EVENTS.MENU_ACTION, (data) => {
      this._handleMenuAction(data.action);
    });
    this.eventBus.subscribe(EVENTS.DIALOGUE_END, (data) => {
      this._handleDialogueEnd(data);
    });
    this.eventBus.subscribe(EVENTS.CHOICE_SELECTED, (data) => {
      this.dialogueSystem.selectChoice(data.choiceIndex);
    });
    this.eventBus.subscribe(EVENTS.DIALOGUE_CONTINUE, () => {
      this.dialogueSystem.advance();
    });
  }

  async _enterMainMenu() {
    const saves = this.saveSystem.listSaves();
    const hasSaves = saves.length > 0;
    this.gamePhase = "main_menu";
    await this.sceneManager.changeScene("start_menu", "none", { hasSaves });
  }

  _handleMenuAction(action) {
    console.log("[Game] Menu action:", action);
    switch (action) {
      case "new_game": this._startNewGame(); break;
      case "continue": this._showLoadGameMenu(); break;
      case "quit": alert("Thanks for playing After Class!"); break;
      default: console.warn("Unknown menu action:", action);
    }
  }

  _startNewGame() {
    this.stateManager.reset();
    this.currentSaveSlot = null;
    this.gamePhase = "visual_novel";
    console.log("[Game] New game started!");
    this.dialogueSystem.startDialogue("story_prologue");
  }

  _showLoadGameMenu() {
    const slots = this._buildSlotList();
    this.gamePhase = "load_select";
    this.uiManager.renderSaveMenu(
      slots,
      (slotNumber) => {
        if (this.saveSystem.loadFromSlot(slotNumber)) {
          this.currentSaveSlot = slotNumber;
          this.gamePhase = "visual_novel";
          this.dialogueSystem.resumeDialogue();
        }
      },
      () => { this._enterMainMenu(); }
    );
  }

  _handleDialogueEnd(data) {
    const dialogueId = data.dialogueId;
    console.log("[Game] Dialogue ended:", dialogueId);
    switch (dialogueId) {
      case "story_prologue":
        this._showChapterChoice();
        break;
      case "day1_maya":
      case "day1_chloe":
      case "day1_hana":
        this.dialogueSystem.startDialogue("day2_confrontation");
        break;
      case "day2_confrontation":
        this._showEnding(data);
        break;
      default:
        console.warn("Unknown dialogue end:", dialogueId);
    }
  }

  _showChapterChoice() {
    const buttons = [
      { text: "Talk to Maya (CS Lab)", action: "maya", onClick: () => this.dialogueSystem.startDialogue("day1_maya") },
      { text: "Talk to Chloe (Campaign Office)", action: "chloe", onClick: () => this.dialogueSystem.startDialogue("day1_chloe") },
      { text: "Talk to Hana (Art Studio)", action: "hana", onClick: () => this.dialogueSystem.startDialogue("day1_hana") }
    ];
    this.uiManager.renderMenu("Who do you investigate first?", buttons);
  }

  _showEnding(data) {
    const endings = {
      ending_maya: "ENDING: The Truth Revealed - Maya exposes the footage. Chloe is ruined.",
      ending_chloe: "ENDING: The Deal - Chloe buries the scandal. She wins. The real killer walks free.",
      ending_hana: "ENDING: The Artist Speaks - Hana reveals everything. She disappears. The truth lives on.",
      ending_truth: "ENDING: The Explosion - You publish everything. Chaos. Some saved. Some destroyed."
    };
    const text = endings[data.dialogueId] || "The End";
    alert(text + "\\n\\nThanks for playing After Class!");
    this._enterMainMenu();
  }

  _buildSlotList() {
    const slots = [];
    for (let i = 1; i <= SAVE_SLOT_COUNT; i++) {
      const meta = this.saveSystem.getSlotMetadata(i);
      slots.push({ number: i, label: "Slot " + i, hasSave: !!meta, meta: meta });
    }
    return slots;
  }

  resumeDialogue() {
    if (this.dialogueSystem.isActive()) {
      const context = this.dialogueSystem.getCurrentContext();
      if (context) {
        this.eventBus.emit(EVENTS.DIALOGUE_ADVANCE, {
          node: context.node, choices: context.choices,
          speaker: context.node.speaker || null,
          text: context.node.text || "",
          expression: context.node.expression || "neutral",
          isEnd: context.node.isEnd || false
        });
      }
    }
  }
}

const game = new Game();
document.addEventListener("DOMContentLoaded", () => { game.init(); });
export default Game;
"""

with open('src/main.js', 'w') as f:
    f.write(c + rest)
print('main.js complete')