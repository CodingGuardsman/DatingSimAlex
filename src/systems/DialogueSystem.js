/**
 * DialogueSystem.js — Runs dialogue trees, evaluates conditions, manages choices
 */
import { EVENTS } from "../utils/constants.js";

export class DialogueSystem {
  constructor(stateManager, eventBus) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.dialogueData = null;
    const dialogueId = this.currentDialogueId;
    this.currentNodeId = null;
    this.activeDialogue = null;
    this.lastChoiceNode = null;
    this.pendingChoiceAdvance = null;
    this.playerLineActive = false;
  }

  setDialogueData(data) {
    this.dialogueData = data;
  }

  /**
   * Add a single dialogue definition (for inline/scenario-specific dialogues).
   */
  addDialogue(dialogueId, dialogueObj) {
    if (!this.dialogueData) this.dialogueData = {};
    this.dialogueData[dialogueId] = dialogueObj;
  }

  startDialogue(dialogueId, params = {}) {
    if (!this.dialogueData || !this.dialogueData[dialogueId]) {
      console.warn(`Dialogue not found: ${dialogueId}`);
      return false;
    }

    this.currentDialogueId = dialogueId;
    this.activeDialogue = this.dialogueData[dialogueId];
    this.pendingChoiceAdvance = null;
    this.playerLineActive = false;
    this._treeBackground = this.activeDialogue.background || null;
    this.currentNodeId = this.activeDialogue.start || Object.keys(this.activeDialogue.nodes)[0];
    this.stateManager.setDialogue(dialogueId);

    const node = this._getNode(this.currentNodeId);
    this._applyNodeEffects(node);

        this.eventBus.emit(EVENTS.DIALOGUE_START, {
      dialogueId,
      node,
      params,
      background: this._treeBackground || null,
      cg: node.cg || null
    });
    this._emitNode(node);

    return true;
  }

  getCurrentContext() {
    if (!this.currentNodeId) return null;
    const node = this._getNode(this.currentNodeId);
    const choices = this._getAvailableChoices(node);
    return { node, choices, dialogueId: this.currentDialogueId };
  }

  advance() {
    if (!this.currentNodeId) return null;

    if (this.playerLineActive && this.pendingChoiceAdvance) {
      this.playerLineActive = false;
      const pending = this.pendingChoiceAdvance;
      this.pendingChoiceAdvance = null;
      if (pending.next) return this.jumpTo(pending.next);
      this.endDialogue();
      return null;
    }

    const node = this._getNode(this.currentNodeId);

    if (node.choices && this._getAvailableChoices(node).length > 0) {
      return this.getCurrentContext();
    }

    if (node.next) {
      return this.jumpTo(node.next);
    }

    if (node.isEnd) {
      this.endDialogue();
      return null;
    }

    this.endDialogue();
    return null;
  }

  jumpTo(nodeId) {
    if (!this.activeDialogue.nodes[nodeId]) {
      console.warn(`Node not found: ${nodeId}`);
      return null;
    }
    this.currentNodeId = nodeId;
    const node = this._getNode(nodeId);
    this._applyNodeEffects(node);
    this._emitNode(node);
    return this.getCurrentContext();
  }

  selectChoice(choiceIndex) {
    const node = this._getNode(this.currentNodeId);
    const choices = this._getAvailableChoices(node);

    if (choiceIndex < 0 || choiceIndex >= choices.length) {
      console.warn("Invalid choice index:", choiceIndex, "available:", choices.length);
      return null;
    }

    const choice = choices[choiceIndex];
    this._applyEffects(choice.effects);
    this.eventBus.emit(EVENTS.CHOICE_MADE, { choice, nodeId: this.currentNodeId });

    this.pendingChoiceAdvance = {
      next: choice.next || null,
      isEnd: Boolean(choice.isEnd || node.isEnd)
    };
    this.playerLineActive = true;
    this.eventBus.emit(EVENTS.DIALOGUE_ADVANCE, {
      node: {
        speaker: "alex",
        text: choice.text,
        expression: "neutral",
        choices: []
      },
      speaker: "alex",
      text: choice.text,
      expression: "neutral",
      choices: [],
      isEnd: false,
      characterId: "alex",
      cg: null,
      background: this._treeBackground || null,
      isPlayerLine: true
    });
    return this.getCurrentContext();
  }

  endDialogue() {
    const dialogueId = this.currentDialogueId;
    this.currentNodeId = null;
    this.activeDialogue = null;
    this.pendingChoiceAdvance = null;
    this.playerLineActive = false;
    this.stateManager.setDialogue(null);
    this.eventBus.emit(EVENTS.DIALOGUE_END, { dialogueId });
  }

  isActive() {
    return this.currentNodeId !== null;
  }

  getActiveDialogueId() {
    return this.currentDialogueId;
  }

  _getNode(nodeId) {
    return this.activeDialogue.nodes[nodeId];
  }

  _evaluateCondition(condition) {
    for (const [key, requirement] of Object.entries(condition)) {
      if (key.startsWith("stat_")) {
        const statName = key.substring(5);
        const value = this.stateManager.getStat(statName);
        if (requirement.min !== undefined && value < requirement.min) return false;
        if (requirement.max !== undefined && value > requirement.max) return false;
        if (requirement.equals !== undefined && value !== requirement.equals) return false;
      } else if (key.startsWith("relationship_") || key.startsWith("rel_")) {
        const charId = key.replace("relationship_", "").replace("rel_", "");
        const value = this.stateManager.getRelationship(charId);
        if (requirement.min !== undefined && value < requirement.min) return false;
        if (requirement.max !== undefined && value > requirement.max) return false;
        if (requirement.equals !== undefined && value !== requirement.equals) return false;
      } else if (key.startsWith("flag_") || key.startsWith("has_")) {
        const flagName = key.replace("flag_", "").replace("has_", "");
        const flagValue = this.stateManager.getFlag(flagName);
        if (requirement.equals !== undefined && flagValue !== requirement.equals) return false;
        if (requirement.exists !== undefined) {
          if (requirement.exists && !this.stateManager.hasFlag(flagName)) return false;
          if (requirement.exists === false && this.stateManager.hasFlag(flagName)) return false;
        }
        if (requirement.equals === true && !flagValue) return false;
        if (requirement.equals === false && flagValue) return false;
      }
    }
    return true;
  }

  _getAvailableChoices(node) {
    if (!node.choices) return [];
    return node.choices.filter(choice => {
      if (!choice.conditions) return true;
      return choice.conditions.every(cond => this._evaluateCondition(cond));
    });
  }

  _applyEffects(effects) {
    if (!effects) return;
    Object.entries(effects).forEach(([key, value]) => {
      if (key.startsWith("stat_")) {
        const statName = key.substring(5);
        this.stateManager.modifyStat(statName, value);
      } else if (key.startsWith("relationship_") || key.startsWith("rel_")) {
        const charId = key.replace("relationship_", "").replace("rel_", "");
        this.stateManager.modifyRelationship(charId, value);
      } else if (key.startsWith("flag_")) {
        const flagName = key.substring(5);
        this.stateManager.setFlag(flagName, value);
      } else if (key.startsWith("set_")) {
        const field = key.substring(4);
        this.stateManager.state[field] = value;
      }
    });
  }

  _applyNodeEffects(node) {
    if (!node) return;
    this._applyEffects(node.effects);
  }

  _emitNode(node) {
    const choices = this._getAvailableChoices(node);
    const text = (node.text || "").toLowerCase();
    const psych = {};
    if (text.includes("dead") || text.includes("kill") || text.includes("murder") || text.includes("blood") || text.includes("die") || text.includes("corpse")) psych.glitch = true;
    if (text.includes("watch") || text.includes("seen") || text.includes("hidden") || text.includes("secret") || text.includes("follow") || text.includes("shadow")) psych.vignette = true;
    if (node.expression === "scared" || node.expression === "worried" || node.expression === "panicked" || node.expression === "afraid") psych.shake = true;
    if (node.expression === "angry" || node.expression === "cold" || node.expression === "intense") psych.redflash = true;
    if (node.expression === "sad") psych.static = true;
    this.eventBus.emit(EVENTS.DIALOGUE_ADVANCE, {
      node,
      speaker: node.speaker || null,
      text: node.text || "",
      expression: node.expression || "neutral",
      choices: choices,
      isEnd: node.isEnd || false,
      characterId: node.character || null,
      cg: node.cg || null,
      background: node.background || this._treeBackground || null,
      psych: psych
    });
  }
}

export default DialogueSystem;
