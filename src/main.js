/**
 * main.js — Game orchestrator / entry point
 * After Class — A visual novel mystery
 */
import { EventBus } from "./engine/EventBus.js";
import { StateManager } from "./engine/StateManager.js";
import { AssetLoader } from "./engine/AssetLoader.js";
import { TransitionManager } from "./engine/TransitionManager.js";
import { SaveSystem } from "./systems/SaveSystem.js";
import { TimeSystem } from "./systems/TimeSystem.js";
import { StatSystem } from "./systems/StatSystem.js";
import { RelationshipSystem } from "./systems/RelationshipSystem.js";
import { DialogueSystem } from "./systems/DialogueSystem.js";
import { UIManager } from "./systems/UIManager.js";
import { SceneManager } from "./systems/sceneManager.js";
import { CharacterFactory } from "./characters/CharacterFactory.js";
import { V0StartMenuScene } from "./scenes/V0StartMenuScene.js";
import { EndOfDayScene } from "./scenes/EndOfDayScene.js";
import { EVENTS, SAVE_SLOT_COUNT } from "./utils/constants.js";

export class Game {
  constructor() {
    this._bgAudio = null;
    window.gameInstance = this;
    this.sceneLayer = document.getElementById("scene-layer");
    this._startBgMusic();
    this.eventBus = new EventBus();
    this.stateManager = new StateManager(this.eventBus);
    this.assetLoader = new AssetLoader();
    this.transitionManager = new TransitionManager(this.sceneLayer);
    this.saveSystem = new SaveSystem(this.stateManager, SAVE_SLOT_COUNT);
    this.timeSystem = new TimeSystem(this.stateManager, this.eventBus);
    this.statSystem = new StatSystem(this.stateManager, this.eventBus);
    this.relationshipSystem = new RelationshipSystem(this.stateManager, this.eventBus);
    this.dialogueSystem = new DialogueSystem(this.stateManager, this.eventBus);
    this.uiManager = new UIManager(this.stateManager, this.eventBus, this.sceneLayer);
    this.sceneManager = new SceneManager(this.stateManager, this.eventBus, this.uiManager, this.sceneLayer);
    this.gamePhase = "init";
    this.characters = {};
    this.dialogueData = null;
    this.isInitialized = false;
    this.currentSaveSlot = null;
    window.__GAME__ = this;
  }

  _startBgMusic() {
    if (this._bgAudio && this._bgAudio.readyState > 0) {
      this._bgAudio.play().catch(e => console.warn("[Audio] Resume blocked:", e));
      return;
    }
    try {
      this._bgAudio = new Audio("assets/audio/Shadowed Staircase.mp3");
      this._bgAudio.loop = true;
      this._bgAudio.volume = 0.3;
      this._bgAudio.play().catch(e => console.warn("[Audio] Autoplay blocked:", e));
    } catch(e) {
      console.warn("[Audio] Failed to load", e);
    }
  }

  async init() {
    console.log("[Game] Initializing After Class...");
    this.dialogueData = await this.assetLoader.loadJSON("src/data/dialogues.json");
    const charactersData = await this.assetLoader.loadJSON("src/data/characters.json");
    console.log("[Game] Data loaded:", {
      dialogues: Object.keys(this.dialogueData).length,
      characters: Object.keys(charactersData).length
    });
    this.characters = CharacterFactory.createFromJSON(charactersData);
    this.dialogueSystem.setDialogueData(this.dialogueData);
    this.sceneManager.registerScene("start_menu", V0StartMenuScene);
    this.sceneManager.registerScene("end_of_day", EndOfDayScene);
    this._bindGameEvents();
    this.isInitialized = true;
    console.log("[Game] Initialization complete.");
    await this._enterMainMenu();
  }
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
    // Clear everything and start fresh
    if (this.sceneLayer) this.sceneLayer.innerHTML = "";
    if (this.uiLayer) {
      this.uiLayer.innerHTML = "";
      this.uiManager.dialogueContainer = null;
    }
    document.querySelectorAll(".v0-start-main, .v0-loading-screen").forEach((element) => element.remove());
    // Start the dialogue - _onDialogueStart will create background and dialogue box
    this.dialogueSystem.startDialogue("intro");
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

    const transitions = {
      "intro": { next: "prologue", text: "The next morning...", hours: 8 },
      "prologue": { next: "chapter1_archive", text: "Later that night...", hours: 4 },
      "chapter1_archive": { next: "chapter2_maya", text: "The following evening...", hours: 24 },
      "chapter2_maya": { next: "chapter3_chloe", text: "The next afternoon...", hours: 18 },
      "chapter3_chloe": { next: "chapter4_hana", text: "Later that evening...", hours: 6 },
      "chapter4_hana": { next: "day5_confrontation", text: "The next day...", hours: 12 }
    };

    const t = transitions[dialogueId];
    if (t) {
      this._showTransition(t.text, () => {
        this.dialogueSystem.startDialogue(t.next);
      });
    } else if (dialogueId === "day5_confrontation") {
      this._showEnding(data);
    }
  }

  _showEnding(data) {
    let chosenEnding = "ending_truth";
    if (this.stateManager.getFlag("flag_ending_maya")) chosenEnding = "ending_maya";
    else if (this.stateManager.getFlag("flag_ending_chloe")) chosenEnding = "ending_chloe";
    else if (this.stateManager.getFlag("flag_ending_hana")) chosenEnding = "ending_hana";

    let trustPoints = 0;
    if (chosenEnding === "ending_maya") trustPoints = this.stateManager.getFlag("flag_maya_trust") || 0;
    else if (chosenEnding === "ending_chloe") trustPoints = this.stateManager.getFlag("flag_chloe_trust") || 0;
    else if (chosenEnding === "ending_hana") trustPoints = this.stateManager.getFlag("flag_hana_trust") || 0;

    const TRUST_THRESHOLD = 3;
    let endingKey = chosenEnding;
    if (chosenEnding !== "ending_truth" && trustPoints < TRUST_THRESHOLD) {
      endingKey = "bad_" + chosenEnding;
    }

    let label = "THE END";
    if (endingKey === "ending_truth") label = "TRUTH ENDING";
    else if (endingKey.startsWith("bad_")) label = "BAD ENDING";
    else label = "GOOD ENDING";

    const endings = {
      ending_maya: "ENDING: THE WATCHER - Maya exposes the footage. Chloes father is named as an accomplice. Dr. Vance is suspended. Maya loses her position. But Richardsons final night is no longer a secret. Someones finally watched the watchers.",
      ending_chloe: "ENDING: THE WINNER - Chloe uses her fathers connections to bury the scandal. She wins the election. The university maintains the original explanation. Dr. Vance continues his career. Richardsons killer remains free. Some truths are buried because people are afraid of what happens when they are found.",
      ending_hana: "ENDING: THE SILENT WITNESS - Hana reveals everything through her art exhibition. The paintings spread far beyond the university. The investigation begins. But Hana disappears from campus before anyone can find her. She finally spoke. Then she disappeared before they could silence her again.",
      ending_truth: "ENDING: AFTER CLASS - Alex publishes everything. The university descends into chaos. Maya loses her job. Chloe loses her campaign and her fathers protection. Hana becomes the center of the investigation. Alex becomes one of the people who exposed everything. No one escapes unchanged. And Richardsons final secret is no longer buried. But the truth had never promised to make anyone happy. It only promised to be the truth.",
      bad_ending_maya: "BAD ENDING: THE TRAITOR - You chose to release the footage but Maya doesnt trust you enough. She refuses to cooperate. The footage never surfaces. Richardsons death is ruled a suicide. Maya keeps her job. The truth dies with her.",
      bad_ending_chloe: "BAD ENDING: THE FOOL - You chose to bury the scandal but Chloe doesnt trust you enough. She cuts you out. Her father handles everything quietly. You know the truth but no one believes you. The election proceeds. Richardsons name is forgotten.",
      bad_ending_hana: "BAD ENDING: THE SILENCE - You chose the art exhibition but Hana doesnt trust you enough. She locks the paintings away. The gallery closes. Her work is destroyed. She disappears. You are left with nothing but questions."
    };
    const text = endings[endingKey] || "The End";

    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 1s ease-in;";
    overlay.innerHTML = '<div style="width:min(880px,90vw);box-sizing:border-box;text-align:center;padding:0 5%;"><p style="font-family:Georgia,serif;font-size:clamp(1rem,3vw,1.8rem);color:' + (endingKey.startsWith("bad_") ? "#e0556a" : "#c9a84c") + ';letter-spacing:0.2em;margin:0 auto 24px;">' + label + '</p><p style="font-family:Georgia,serif;font-size:clamp(0.8rem,2vw,1.3rem);color:#e8e0d0;width:100%;max-width:80ch;margin:0 auto;line-height:1.6;text-align:center;">' + text + '</p><p style="margin:32px auto 0;font-size:0.9rem;color:#888;">Trust points: ' + trustPoints + '</p><button style="margin-top:24px;padding:12px 40px;font-size:1rem;letter-spacing:0.15em;text-transform:uppercase;background:#2a2040;color:#e8c97a;border:1px solid #c9a84c;cursor:pointer;border-radius:4px;">Return to Start</button></div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = "1"; });
    overlay.querySelector("button").addEventListener("click", () => {
      overlay.remove();
      window.gameInstance._enterMainMenu();
    });
  }

  _showTransition(text, callback) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity 1.2s ease-in;";
    overlay.innerHTML = '<div style="font-family:Georgia,serif;font-size:clamp(1.2rem,3vw,2rem);color:#c9a84c;letter-spacing:0.15em;text-align:center;padding:0 10%;">' + text + '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = "1"; });
    setTimeout(() => {
      overlay.style.transition = "opacity 0.8s ease-out";
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        callback();
      }, 800);
    }, 1800);
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
