/**
 * UIManager.js — Centralized UI creation, rendering, and event delegation
 */
import { EVENTS } from "../utils/constants.js";
import { STAT_NAMES, STAT_LABELS, STAT_COLORS } from "../utils/constants.js";

export class UIManager {
  constructor(stateManager, eventBus, sceneLayer) {
    this.stateManager = stateManager;
    this.eventBus = eventBus;
    this.sceneLayer = sceneLayer;
    this.uiLayer = document.getElementById("ui-layer");
    this.dialogueContainer = document.getElementById("dialogue-box-container");
    this.currentView = null;
    this.dialogueSfx = {
      alex: "assets/audio/sfx/ElevenLabs_2026-09-21T18_46_36_Roger - Laid-Back, Casual, Resonant_pre_sp100_s50_sb75_se0_b_m2.mp3",
      maya: "assets/audio/sfx/ElevenLabs_2026-09-21T18_50_04_Tessa - Influencer Girl_pvc_sp100_s100_sb75_se26_b_m2.mp3",
      chloe: "assets/audio/sfx/ElevenLabs_2026-09-21T18_50_20_Lyan - Female Genuine Casual Ads_pvc_sp116_s18_sb88_se79_b_m2.mp3",
      hana: "assets/audio/sfx/ElevenLabs_2026-09-21T18_50_32_Lyan - Female Genuine Casual Ads_pvc_sp116_s18_sb88_se79_b_m2.mp3"
    };
    this.lastDialogueSfxAt = 0;
    this.dialogueSfxChance = 0.18;
    this.dialogueSfxCooldown = 1800;

    // Create sub-containers
    this._setupContainers();

    // Bind internal event handlers
    this._bindEvents();
  }

  _setupContainers() {
    // Character sprite slot
    let slot = document.getElementById("character-sprite-slot");
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
    }
  }

  _bindEvents() {
    this.eventBus.subscribe(EVENTS.DIALOGUE_START, (data) => this._onDialogueStart(data));
    this.eventBus.subscribe(EVENTS.DIALOGUE_ADVANCE, (data) => this._onDialogueAdvance(data));
    this.eventBus.subscribe(EVENTS.DIALOGUE_END, () => this._onDialogueEnd());
    this.eventBus.subscribe(EVENTS.TIME_CHANGE, (data) => this._onTimeChange(data));
    this.eventBus.subscribe(EVENTS.STAT_CHANGE, (data) => this._onStatChange(data));
  }

  /* ==================== DIALOGUE BOX ==================== */

  _onDialogueStart(data) {
    const menu = document.getElementById('menu-container');
    if (menu) menu.style.display = 'none';
    const saveMenu = document.getElementById('save-slots-container');
    if (saveMenu) saveMenu.style.display = 'none';

    // Use background from dialogue data, fallback to university
    const bgId = (data && data.background) ? data.background : 'university';
    this.renderBackground(bgId);

    // Show CG still if present
    if (data && data.cg) {
      this.renderCGImage(data.cg);
    } else {
      const existing = document.getElementById('cg-still');
      if (existing) existing.remove();
    }

    this._showDialogueBox();
    // Start the first dialogue with the protagonist on the left.
    const startSpeaker = (data.node && data.node.speaker) || 'alex';
    const startExpression = (data.node && data.node.expression) || 'neutral';
    this.renderCharacterSprite(startSpeaker, startExpression, 'left');
  }

  _onDialogueAdvance(data) {
    if (!data || !data.node) return;
    this._maybePlayDialogueSfx(data);
    if (data.background) {
      this.renderBackground(data.background);
    }
    // Update CG if changed
    if (data.cg) {
      this.renderCGImage(data.cg);
    } else {
      const existing = document.getElementById('cg-still');
      if (existing) existing.remove();
    }
    this.renderDialogueNode(data);
  }

  _maybePlayDialogueSfx(data) {
    const speaker = data.speaker || "alex";
    const source = this.dialogueSfx[speaker];
    const now = Date.now();
    if (!source || now - this.lastDialogueSfxAt < this.dialogueSfxCooldown || Math.random() > this.dialogueSfxChance) {
      return;
    }

    const sound = new Audio(source);
    sound.volume = 0.28;
    sound.play().catch(() => {});
    this.lastDialogueSfxAt = now;
  }

  _onDialogueEnd() {
    this._hideDialogueBox();
  }

  renderDialogueNode(data) {
    const { node, choices, expression, speaker, text } = data;

    const box = document.getElementById("dialogue-box");
    if (!box) return;

    const speakerEl = document.getElementById("dialogue-speaker");
    const textEl = document.getElementById("dialogue-text");
    const choicesEl = document.getElementById("dialogue-choices");

    // Narration is presented through Alex on the left; named characters stay on the right.
    const effectiveSpeaker = speaker || "alex";
    speakerEl.textContent = this._getCharacterName(effectiveSpeaker);
    speakerEl.style.display = "block";

    // Text
    textEl.textContent = this._formatDialogueText(text, effectiveSpeaker);

    // Update character sprite expression
    // Always show a character portrait — null speaker = Alex's internal narration
    if (effectiveSpeaker && expression) {
      this.renderCharacterSprite(effectiveSpeaker, expression, effectiveSpeaker === "alex" ? "left" : "right");
    } else {
      this._clearCharacterSprite();
    }

    // Render choices
    choicesEl.innerHTML = "";

    if (data.isPlayerLine) {
      const btn = document.createElement("button");
      btn.textContent = "Continue";
      btn.title = "Continue to the other speaker";
      btn.className = "continue-btn";
      btn.addEventListener("click", () => {
        this.eventBus.emit(EVENTS.DIALOGUE_CONTINUE);
      });
      choicesEl.appendChild(btn);
      choicesEl.style.display = "flex";
    } else if (choices && choices.length > 0) {
      choices.forEach((choice, index) => {
        const btn = document.createElement("button");
        btn.textContent = this._formatDialogueText(choice.text);
        btn.className = "choice-btn";
        btn.addEventListener("click", () => {
          this.eventBus.emit(EVENTS.CHOICE_SELECTED, { choiceIndex: index, choice });
        });
        choicesEl.appendChild(btn);
      });
      choicesEl.style.display = "flex";
    } else {
      // Show continue prompt
      const btn = document.createElement("button");
      btn.textContent = "Continue";
      btn.title = "Continue";
      btn.className = "continue-btn";
      btn.addEventListener("click", () => {
        this.eventBus.emit(EVENTS.DIALOGUE_CONTINUE);
      });
      choicesEl.appendChild(btn);
      choicesEl.style.display = "flex";
    }
  }

  _formatDialogueText(value, speaker = null) {
    const text = String(value || "")
      .replace(/\b(isnt|isnt)\b/gi, "isn't")
      .replace(/\b(doesnt)\b/gi, "doesn't")
      .replace(/\b(dont)\b/gi, "don't")
      .replace(/\b(didnt)\b/gi, "didn't")
      .replace(/\b(cant)\b/gi, "can't")
      .replace(/\b(wont)\b/gi, "won't")
      .replace(/\b(youre)\b/gi, "you're")
      .replace(/\b(im)\b/gi, "I'm")
      .replace(/\b(Its)\b/g, "It's")
      .replace(/\b(hes)\b/gi, "he's")
      .replace(/\b(shes)\b/gi, "she's")
      .replace(/\b(theyre)\b/gi, "they're")
      .replace(/\b(whats)\b/gi, "what's")
      .replace(/\b(thats)\b/gi, "that's")
      .replace(/\b(id)\b/g, "I'd")
      .replace(/\b(ive)\b/gi, "I've")
      .replace(/([?!])\s+/g, "$1\n");

    return text;
  }

  _showDialogueBox() {
    this.dialogueContainer = document.getElementById("dialogue-box-container");
    if (!this.dialogueContainer) {
      this.dialogueContainer = document.createElement("div");
      this.dialogueContainer.id = "dialogue-box-container";
      this.uiLayer.appendChild(this.dialogueContainer);
    }
    this.dialogueContainer.innerHTML = "";
    const box = document.createElement("div");
    box.className = "dialogue-box";
    box.id = "dialogue-box";

    const speakerEl = document.createElement("div");
    speakerEl.className = "dialogue-speaker";
    speakerEl.id = "dialogue-speaker";
    box.appendChild(speakerEl);

    const textEl = document.createElement("div");
    textEl.className = "dialogue-text";
    textEl.id = "dialogue-text";
    box.appendChild(textEl);

    const choicesEl = document.createElement("div");
    choicesEl.className = "dialogue-choices";
    choicesEl.id = "dialogue-choices";
    box.appendChild(choicesEl);

    this.dialogueContainer.appendChild(box);
  }

  renderCGImage(imagePath) {
    const layer = this.sceneLayer;
    const existing = document.getElementById("cg-still");
    if (existing) existing.remove();
    const img = document.createElement("img");
    img.id = "cg-still";
    img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:3;animation:fadeIn 0.8s ease;";
    img.src = imagePath;
    layer.appendChild(img);
  }

  _hideDialogueBox() {
    const container = document.getElementById("dialogue-box-container");
    if (container) container.innerHTML = "";
    this._clearCharacterSprite();
  }

  _clearCharacterSprite() {
    const slot = document.getElementById("character-sprite-slot");
    if (slot) slot.innerHTML = "";
  }

  _getCharacterName(charId) {
    const names = {
      alex: "Alex", maya: "Maya", chloe: "Chloe",
      hana: "Hana", 
    };
    return names[charId] || charId;
  }

  /* ==================== STAT DISPLAY ==================== */

  renderStats(containerId = "stat-display") {
    const state = this.stateManager.state;
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className = "stat-display";
      this.uiLayer.appendChild(container);
    }
    container.innerHTML = "";
    STAT_NAMES.forEach(stat => {
      const value = state.stats[stat] ?? 0;
      const row = this._createStatBar(stat, value);
      container.appendChild(row);
    });
    return container;
  }

  updateStats() {
    const state = this.stateManager.state;
    const container = document.getElementById("stat-display");
    if (!container) this.renderStats();
    container.innerHTML = "";
    STAT_NAMES.forEach(stat => {
      const value = state.stats[stat] ?? 0;
      container.appendChild(this._createStatBar(stat, value));
    });
  }

  _createStatBar(stat, value) {
    const row = document.createElement("div");
    row.className = "stat-bar";

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = STAT_LABELS[stat];
    row.appendChild(label);

    const valueEl = document.createElement("span");
    valueEl.className = "value";
    valueEl.textContent = String(value);
    row.appendChild(valueEl);

    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${value}%`;
    fill.style.backgroundColor = STAT_COLORS[stat];
    bar.appendChild(fill);
    row.appendChild(bar);

    return row;
  }

  /* ==================== TIME & LOCATION DISPLAY ==================== */

  _onTimeChange(data) {
    this.updateTimeDisplay();
  }

  updateTimeDisplay() {
    const timeEl = document.getElementById("time-display");
    if (!timeEl) return;
    const state = this.stateManager.state;
    timeEl.textContent = `Day ${state.day} — ${state.timeOfDay}`;
  }

  renderTimeDisplay() {
    const state = this.stateManager.state;
    let el = document.getElementById("time-display");
    if (!el) {
      el = document.createElement("div");
      el.id = "time-display";
      el.className = "time-display";
      this.sceneLayer.appendChild(el);
    }
    el.textContent = `Day ${state.day} — ${state.timeOfDay}`;
    return el;
  }

  renderLocationLabel(label) {
    let el = document.getElementById("location-label");
    if (!el) {
      el = document.createElement("div");
      el.id = "location-label";
      el.className = "location-label";
      this.sceneLayer.appendChild(el);
    }
    el.textContent = label;
    return el;
  }

  /* ==================== MENUS ==================== */

  renderMenu(title, buttons, containerId = "menu-container") {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className = "menu";
      this.uiLayer.appendChild(container);
    }
    container.innerHTML = "";

    const titleEl = document.createElement("h1");
    titleEl.textContent = title;
    container.appendChild(titleEl);

    buttons.forEach(btn => {
      const button = document.createElement("button");
      button.textContent = btn.text;
      button.className = btn.className || "";
      if (btn.disabled) button.disabled = true;
      if (btn.id) button.id = btn.id;
      button.addEventListener("click", (e) => {
        e.preventDefault();
        container.style.display = "none";
        btn.onClick();
      });
      container.appendChild(button);
    });

    return container;
  }

  /* ==================== SAVE SLOTS ==================== */

  renderSaveSlots(slots, onSelect, containerId = "save-slots-container") {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className = "save-slots";
      this.uiLayer.appendChild(container);
    }
    container.innerHTML = "";

    slots.forEach(slot => {
      const slotEl = document.createElement("div");
      slotEl.className = `save-slot ${slot.hasSave ? "" : "empty"}`;
      slotEl.dataset.slot = slot.number;

      const title = document.createElement("div");
      title.style.fontWeight = "bold";
      title.textContent = slot.label || `Slot ${slot.number}`;
      slotEl.appendChild(title);

      if (slot.hasSave && slot.meta) {
        const dayEl = document.createElement("div");
        dayEl.style.fontSize = "0.85rem";
        dayEl.style.color = "#a0a0b0";
        dayEl.textContent = `Day ${slot.meta.day} · ${slot.meta.timeOfDay}`;
        slotEl.appendChild(dayEl);

        const dateEl = document.createElement("div");
        dateEl.style.fontSize = "0.75rem";
        dateEl.style.color = "#808090";
        dateEl.textContent = new Date(slot.meta.savedAt).toLocaleDateString();
        slotEl.appendChild(dateEl);
      }

      slotEl.addEventListener("click", () => onSelect(slot.number));
      container.appendChild(slotEl);
    });

    return container;
  }

  /* ==================== SAVE MENU ==================== */

  renderSaveMenu(slots, onSelect, onCancel, containerId = "save-menu-container") {
    this.clearUI();

    const container = document.createElement("div");
    container.id = containerId;
    container.className = "menu";
    this.uiLayer.appendChild(container);

    const titleEl = document.createElement("h1");
    titleEl.textContent = "Choose Save Slot";
    container.appendChild(titleEl);

    slots.forEach(slot => {
      const slotEl = document.createElement("div");
      slotEl.className = `save-slot ${slot.hasSave ? "" : "empty"}`;

      const title = document.createElement("div");
      title.style.fontWeight = "bold";
      title.textContent = slot.label || `Slot ${slot.number}`;
      slotEl.appendChild(title);

      if (slot.hasSave && slot.meta) {
        const dayEl = document.createElement("div");
        dayEl.style.fontSize = "0.85rem";
        dayEl.style.color = "#a0a0b0";
        dayEl.textContent = `Day ${slot.meta.day} · ${slot.meta.timeOfDay} · ${new Date(slot.meta.savedAt).toLocaleDateString()}`;
        slotEl.appendChild(dayEl);
      }

      slotEl.addEventListener("click", () => onSelect(slot.number));
      container.appendChild(slotEl);
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.marginTop = "1rem";
    cancelBtn.addEventListener("click", onCancel);
    container.appendChild(cancelBtn);

    return container;
  }

  /* ==================== CHARACTER SPRITE ==================== */

  renderCharacterSprite(charId, expression = "neutral", position = "right") {
    const container = document.getElementById("character-sprite-slot") || this._createCharSlot();
    container.innerHTML = "";
    container.id = "character-sprite-slot";
    container.style.position = "absolute";
    container.style.left = "0";
    container.style.top = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.zIndex = "5";
    container.style.display = "block";
    container.style.overflow = "hidden";
    container.style.background = "transparent";
    container.style.pointerEvents = "none";

    const label = `${this._getCharacterName(charId)}`;
    const bgColor = this._getCharacterColor(charId);
    const isAlex = charId === "alex";
    const horizontalPosition = isAlex ? "left:3%;" : "right:3%;";
    const portraitSize = isAlex
      ? "width:36vw;height:68vh;object-fit:cover;object-position:center top;transform:scale(1.15);transform-origin:bottom left;"
      : "width:28vw;height:59vh;object-fit:contain;object-position:center bottom;transform:scale(1.15);transform-origin:bottom right;";

    const expressionMap = {
      alex: {
        neutral: "assets/images/portraits/Alex/smart_casual_neutral.png",
        curious: "assets/images/portraits/Alex/smart_casual_confused.png",
        scared: "assets/images/portraits/Alex/smart_casual_shocked.png",
        determined: "assets/images/portraits/Alex/smart_casual_confident.png",
        angry: "assets/images/portraits/Alex/smart_casual_angry.png",
        sad: "assets/images/portraits/Alex/smart_casual_sad.png",
        worried: "assets/images/portraits/Alex/smart_casual_confused.png",
        cold: "assets/images/portraits/Alex/smart_casual_smirk.png",
        smirk: "assets/images/portraits/Alex/smart_casual_smirk.png",
        focused: "assets/images/portraits/Alex/smart_casual_thinking.png",
        intense: "assets/images/portraits/Alex/smart_casual_confident.png",
        panicked: "assets/images/portraits/Alex/smart_casual_shocked.png",
        relieved: "assets/images/portraits/Alex/smart_casual_happy.png",
        smiling: "assets/images/portraits/Alex/smart_casual_smile.png",
        afraid: "assets/images/portraits/Alex/smart_casual_shocked.png",
        default: "assets/images/portraits/Alex/smart_casual_neutral.png"
      },
      chloe: {
        neutral: "assets/images/portraits/Chloe/Char_Emotion_Neutral_00222.png",
        smiling: "assets/images/portraits/Chloe/Char_Emotion_Happy_00105.png",
        cold: "assets/images/portraits/Chloe/Char_Emotion_Smug_00203.png",
        afraid: "assets/images/portraits/Chloe/Char_Emotion_Surprised_00105.png",
        determined: "assets/images/portraits/Chloe/Char_Emotion_Happy_00105.png",
        worried: "assets/images/portraits/Chloe/Char_Emotion_Embarrassed_00106.png",
        angry: "assets/images/portraits/Chloe/Char_Emotion_Angry_00241.png",
        sad: "assets/images/portraits/Chloe/Char_Emotion_Sad_00105.png",
        smirk: "assets/images/portraits/Chloe/Char_Emotion_Smug_00203.png",
        focused: "assets/images/portraits/Chloe/Char_Emotion_Neutral_00222.png",
        intense: "assets/images/portraits/Chloe/Char_Emotion_Angry_00241.png",
        panicked: "assets/images/portraits/Chloe/Char_Emotion_Surprised_00105.png",
        relieved: "assets/images/portraits/Chloe/Char_Emotion_Happy_00105.png",
        curious: "assets/images/portraits/Chloe/Char_Emotion_Neutral_00222.png",
        scared: "assets/images/portraits/Chloe/Char_Emotion_Surprised_00105.png",
        default: "assets/images/portraits/Chloe/Char_Emotion_Neutral_00222.png"
      },
      hana: {
        neutral: "assets/images/portraits/Hana/Char_Emotion_Neutral_00073.png",
        intense: "assets/images/portraits/Hana/Char_Emotion_Angry_00093.png",
        sad: "assets/images/portraits/Hana/Char_Emotion_Sad_00073.png",
        relieved: "assets/images/portraits/Hana/Char_Emotion_Happy_00073.png",
        worried: "assets/images/portraits/Hana/Char_Emotion_Embarrassed_00055.png",
        panicked: "assets/images/portraits/Hana/Char_Emotion_Surprised_00073.png",
        determined: "assets/images/portraits/Hana/Char_Emotion_Angry_00093.png",
        angry: "assets/images/portraits/Hana/Char_Emotion_Angry_00093.png",
        smiling: "assets/images/portraits/Hana/Char_Emotion_Happy_00073.png",
        cold: "assets/images/portraits/Hana/Char_Emotion_Smug_00055.png",
        afraid: "assets/images/portraits/Hana/Char_Emotion_Surprised_00073.png",
        smirk: "assets/images/portraits/Hana/Char_Emotion_Smug_00055.png",
        focused: "assets/images/portraits/Hana/Char_Emotion_Neutral_00073.png",
        curious: "assets/images/portraits/Hana/Char_Emotion_Confused_00055.png",
        scared: "assets/images/portraits/Hana/Char_Emotion_Surprised_00073.png",
        default: "assets/images/portraits/Hana/Char_Emotion_Neutral_00073.png"
      },
      maya: {
        neutral: "assets/images/portraits/Maya/Char_Emotion_Neutral_00221.png",
        smirk: "assets/images/portraits/Maya/Char_Emotion_Smug_00202.png",
        focused: "assets/images/portraits/Maya/Char_Emotion_Neutral_00221.png",
        worried: "assets/images/portraits/Maya/Char_Emotion_Embarrassed_00105.png",
        cold: "assets/images/portraits/Maya/Char_Emotion_Smug_00202.png",
        angry: "assets/images/portraits/Maya/Char_Emotion_Angry_00240.png",
        determined: "assets/images/portraits/Maya/Char_Emotion_Happy_00104.png",
        sad: "assets/images/portraits/Maya/Char_Emotion_Sad_00104.png",
        smiling: "assets/images/portraits/Maya/Char_Emotion_Happy_00104.png",
        afraid: "assets/images/portraits/Maya/Char_Emotion_Surprised_00104.png",
        intense: "assets/images/portraits/Maya/Char_Emotion_Angry_00240.png",
        panicked: "assets/images/portraits/Maya/Char_Emotion_Surprised_00104.png",
        relieved: "assets/images/portraits/Maya/Char_Emotion_Happy_00104.png",
        curious: "assets/images/portraits/Maya/Char_Emotion_Neutral_00221.png",
        scared: "assets/images/portraits/Maya/Char_Emotion_Surprised_00104.png",
        default: "assets/images/portraits/Maya/Char_Emotion_Neutral_00221.png"
      }
    };

    const exprMap = expressionMap[charId] || {};
    const portraitPath = exprMap[expression] || exprMap["default"] || exprMap["neutral"];
if (!portraitPath) {
      return;
    }

    // Cache images to prevent flickering on every dialogue advance
    if (!this._portraitCache) this._portraitCache = {};
    const cacheKey = charId + "_" + expression;
    if (this._portraitCache[cacheKey]) {
      const cached = this._portraitCache[cacheKey].cloneNode(true);
      cached.style.cssText = portraitSize + "position:absolute;" + horizontalPosition + "bottom:12%;";
      container.appendChild(cached);
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Cache the loaded image
      this._portraitCache[cacheKey] = img.cloneNode(true);
      container.innerHTML = "";
      img.alt = label;
      img.style.cssText = portraitSize + "position:absolute;" + horizontalPosition + "bottom:12%;";
      container.appendChild(img);
    };
    img.onerror = () => {
      this._renderPortraitFallback(container, label, bgColor);
    };
    img.src = portraitPath;
  }

  _renderPortraitFallback(container, label, bgColor) {
    container.innerHTML = "";
    const fallback = document.createElement("div");
    fallback.textContent = label[0];
    fallback.style.cssText = "width:140px;height:180px;border-radius:12px;background:" + bgColor + ";display:flex;align-items:center;justify-content:center;color:#fff;font-size:4rem;font-weight:bold;border:2px solid rgba(255,255,255,0.7);";
    container.appendChild(fallback);
  }

  _createCharSlot() {
    const slot = document.createElement("div");
    slot.id = "character-sprite-slot";
    this.sceneLayer.appendChild(slot);
    return slot;
  }

  _getCharacterColor(charId) {
    const colors = {
      alex: "#4a90d9", maya: "#7b4aea", chloe: "#e94560",
      hana: "#52b4a9", 
    };
    return colors[charId] || "#555";
  }

  /* ==================== BACKGROUND ==================== */

  renderBackground(bgId) {
    let bg = document.getElementById("background-image");
    if (!bg) {
      bg = document.createElement("img");
      bg.id = "background-image";
      bg.className = "background-image";
      this.sceneLayer.insertBefore(bg, this.sceneLayer.firstChild);
    }

    bg.alt = bgId;
    bg.style.background = this._getBackgroundGradient(bgId);
    bg.style.objectFit = "cover";
    bg.style.width = "100%";
    bg.style.height = "100%";
    bg.style.position = "absolute";
    bg.style.top = "0";
    bg.style.left = "0";
    bg.style.zIndex = "0";
    bg.style.display = "block";
    const backgroundAssets = {
      bedroom: "assets/images/backgrounds/bedroom.png",
      campus: "assets/images/backgrounds/campus.png",
      university: "assets/images/backgrounds/classroom-hero.jpg",
      library: "assets/images/backgrounds/library.jpeg",
      archive: "assets/images/backgrounds/archuive.jpeg",
      security: "assets/images/backgrounds/security_room.jpeg",
      campaign: "assets/images/backgrounds/campaign_office.jpeg",
      gallery: "assets/images/backgrounds/gallery.jpeg",
      research: "assets/images/backgrounds/research_building.jpeg",
      old_research: "assets/images/backgrounds/old research builkding.jpeg",
      default: "assets/images/backgrounds/classroom-hero.jpg"
    };
    bg.src = backgroundAssets[bgId] || backgroundAssets["default"] || this._createBackgroundDataUrl(bgId);
    return bg;
  }

  _createBackgroundDataUrl(bgId) {
    const gradients = {
      bedroom: ["#667eea", "#764ba2", "#f6d365"],
      campus: ["#1a2a6c", "#b21f1f", "#1a2a6c"],
      default: ["#16213e", "#0f3460", "#1f4068"]
    };
    const [start, mid, end] = gradients[bgId] || gradients.default;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="${start}"/>
            <stop offset="50%" stop-color="${mid}"/>
            <stop offset="100%" stop-color="${end}"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#bg)"/>
        <circle cx="230" cy="140" r="110" fill="rgba(255,255,255,0.10)"/>
        <circle cx="980" cy="150" r="140" fill="rgba(255,255,255,0.08)"/>
        <rect x="0" y="560" width="1200" height="240" fill="rgba(0,0,0,0.15)"/>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  _createPlaceholderImage(label, bgColor, charId) {
    const initials = (charId || "?").slice(0, 2).toUpperCase();
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="700" viewBox="0 0 500 700">
        <rect width="500" height="700" fill="${bgColor}"/>
        <circle cx="250" cy="210" r="120" fill="rgba(255,255,255,0.18)"/>
        <rect x="110" y="340" width="280" height="220" rx="26" fill="rgba(255,255,255,0.12)"/>
        <text x="250" y="360" text-anchor="middle" font-size="120" fill="white" font-family="Arial, sans-serif" font-weight="700">${initials}</text>
        <text x="250" y="610" text-anchor="middle" font-size="34" fill="white" font-family="Arial, sans-serif">${label}</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  _getBackgroundGradient(bgId) {
    const gradients = {
      bedroom: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      campus: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 0%, #1a2a6c 100%)",
      default: "linear-gradient(135deg, #16213e 0%, #0f3460 100%)"
    };
    return gradients[bgId] || gradients.default;
  }

  /* ==================== END OF DAY SCREEN ==================== */

  renderEndOfDay(state, onContinue) {
    let container = document.getElementById("end-of-day-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "end-of-day-container";
      container.className = "menu";
      this.uiLayer.appendChild(container);
    }
    container.innerHTML = "";

    const title = document.createElement("h1");
    title.textContent = `Day ${state.day} Complete`;
    container.appendChild(title);

    const statSummary = document.createElement("div");
    statSummary.style.margin = "1rem 0";
    statSummary.style.textAlign = "left";
    STAT_NAMES.forEach(stat => {
      const row = document.createElement("div");
      row.style.marginBottom = "0.3rem";
      const label = document.createElement("span");
      label.style.display = "inline-block";
      label.style.width = "120px";
      label.textContent = STAT_LABELS[stat] + ":";
      const value = document.createElement("span");
      value.style.fontWeight = "bold";
      value.style.color = STAT_COLORS[stat];
      value.textContent = state.stats[stat] ?? 0;
      row.appendChild(label);
      row.appendChild(value);
      statSummary.appendChild(row);
    });
    container.appendChild(statSummary);

    const relSummary = document.createElement("div");
    relSummary.style.margin = "1rem 0";
    relSummary.style.textAlign = "left";
    relSummary.style.fontSize = "0.9rem";
    const relTitle = document.createElement("div");
    relTitle.style.marginBottom = "0.5rem";
    relTitle.textContent = "Relationships:";
    relTitle.style.fontWeight = "bold";
    relSummary.appendChild(relTitle);

    Object.entries(state.relationships).forEach(([charId, val]) => {
      const row = document.createElement("div");
      row.style.marginBottom = "0.2rem";
      const name = document.createElement("span");
      name.style.display = "inline-block";
      name.style.width = "100px";
      name.textContent = `${this._getCharacterName(charId)}:`;
      const relValue = document.createElement("span");
      relValue.textContent = val;
      row.appendChild(name);
      row.appendChild(relValue);
      relSummary.appendChild(row);
    });
    container.appendChild(relSummary);

    const continueBtn = document.createElement("button");
    continueBtn.textContent = "Continue";
    continueBtn.addEventListener("click", () => {
      container.innerHTML = "";
      container.style.display = "none";
      onContinue();
    });
    container.appendChild(continueBtn);

    return container;
  }

  /* ==================== OVERLAY ==================== */

  showOverlay(text, subtext = null) {
    let overlay = document.getElementById("overlay-container");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "overlay-container";
      overlay.className = "overlay";
      this.uiLayer.appendChild(overlay);
    }
    overlay.innerHTML = "";
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
    textEl.style.color = "#e8e0d0";
    textEl.style.fontSize = "1.8rem"; textEl.style.fontFamily = "Georgia, serif";
    overlay.appendChild(textEl);

    if (subtext) {
      const subEl = document.createElement("div");
      subEl.className = "scene-card-subtitle";
      subEl.textContent = subtext;
      overlay.appendChild(subEl);
    }

    return overlay;
  }

  hideOverlay() {
    const overlay = document.getElementById("overlay-container");
    if (overlay) overlay.style.display = "none";
  }

  /* ==================== UTILITY ==================== */

  clearUI() {
    if (this.dialogueContainer && this.dialogueContainer.parentNode) {
      this.dialogueContainer.innerHTML = "";
    }
    if (this.uiLayer) {
      this.uiLayer.innerHTML = "";
    }
  }

  _onStatChange(data) {
    // Can be used for floating text or animations
  }
}

export default UIManager;



