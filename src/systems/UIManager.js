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

    // Create sub-containers
    this._setupContainers();

    // Bind internal event handlers
    this._bindEvents();
    // Start all meta watchers after a delay (only after game completion matters)
    setTimeout(() => {
      this._startHintSystem();
      this._startTabWatch();
      this._startStorageWatch();
      this._startPrintWatch();
      this._startNavigationWatch();
      this._startAccessibilityWatch();
      this._startNetworkWatch();
      this._startClipboardWatch();
      this._startFingerprintWatch();
      this._startDragWatch();
      this._startHistoryWatch();
      this._startContextMenuWatch();
      this._startFullscreenWatch();
      this._startTitleWatch();
      this._startScreenReaderWatch();
      this._startDownloadWatch();
      this._startMouseTrailWatch();
      this._checkConsoleCommands();
      this._checkFileManipulation();
      // Mark completion in localStorage if flag is set
      if (this.stateManager && this.stateManager.getFlag('completed')) {
        this._markGameCompleted();
      }
    }, 30000);
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

  /* ==================== FOURTH WALL / META ==================== */

  _getPlayTime() {
    if (!this._playStart) this._playStart = Date.now();
    return Math.floor((Date.now() - this._playStart) / 1000);
  }

  _getSaveCount() {
    try { return localStorage ? Object.keys(localStorage).filter(k => k.startsWith('save_slot_')).length : 0; } catch(e) { return 0; }
  }

  _showMetaMessage(text, duration) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:rgba(10,8,16,0.97);color:#e8e0d0;padding:2rem 3rem;border:2px solid #c9a84c;border-radius:4px;font-family:Georgia,serif;font-size:1.1rem;max-width:80vw;line-height:1.7;text-align:center;opacity:0;transition:opacity 1.5s;';
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 1500); }, duration || 5000);
  }

  _showMetaVoiceOverlay(text) {
    // Create overlay for meta voice
    const overlay = document.createElement('div');
    overlay.className = 'meta-voice-overlay';
    overlay.id = 'meta-voice-overlay';
    document.body.appendChild(overlay);
    
    // Create text element
    const textEl = document.createElement('div');
    textEl.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:rgba(10,8,16,0.95);color:#ff00ff;padding:2rem 3rem;border:2px solid #ff00ff;border-radius:4px;font-family:Georgia,serif;font-size:1.2rem;line-height:1.6;max-width:80vw;text-align:center;text-shadow:0 0 20px #ff00ff;';
    textEl.className = 'corrupted-text';
    textEl.textContent = text;
    document.body.appendChild(textEl);
    
    // Remove after duration
    setTimeout(() => {
      overlay.remove();
      textEl.remove();
    }, 5000);
  }

  _showTypewriter(text, duration) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:rgba(10,8,16,0.97);color:#8b0000;padding:2rem 3rem;border:1px solid #8b0000;border-radius:4px;font-family:monospace;font-size:1rem;max-width:80vw;line-height:1.7;opacity:0;transition:opacity 1s;';
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    let i = 0;
    const type = () => {
      if (i < text.length) {
        el.textContent = text.slice(0, i + 1) + (i % 2 ? '' : '_');
        i++;
        setTimeout(type, 60);
      } else {
        el.textContent = text;
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 1500); }, duration || 4000);
      }
    };
    type();
  }

  _triggerFourthWall() {
    const t = this._getPlayTime();
    const msgs = [];
    if (t > 120) msgs.push('Youve been playing for ' + Math.floor(t/60) + ' minutes. Are you okay?');
    if (this._getSaveCount() > 3) msgs.push('Youve saved ' + this._getSaveCount() + ' times. Looking for something you missed?');
    if (t > 300) msgs.push('Most people would have given up by now. Youre different.');
    if (t > 600) msgs.push('You keep coming back. I see you.');
    if (msgs.length > 0 && Math.random() < 0.5) {
      this._showMetaMessage(msgs[Math.floor(Math.random() * msgs.length)], 6000);
    }
  }

  _startAmbientMeta() {
    const phrases = [
      'Youre still here.',
      'I know what you did.',
      'Richardson is watching.',
      'You cant close this window.',
      'I see you reading over your shoulder.',
      'The archive remembers everything.',
      'You should have stopped at the prologue.',
      'Turn back. You dont want to know.',
      'Every choice you make is recorded.',
      'You cant trust anyone. Not even yourself.',
      'The masked figure is you.',
      'You left the archive. You shouldnt have.',
      'I know where you live.',
      'This is not a game anymore.',
      'Youre trapped here with me.'
    ];
    setInterval(() => {
      if (Math.random() < 0.12) {
        const p = phrases[Math.floor(Math.random() * phrases.length)];
        if (Math.random() < 0.3) {
          this._showTypewriter(p, 4000);
        } else {
          this._showMetaMessage(p, 4000);
        }
      }
    }, 20000);

    setInterval(() => {
      if (Math.random() < 0.08) {
        const names = ['Alex', 'player', 'you', 'visitor', 'intruder', 'watcher'];
        const n = names[Math.floor(Math.random() * names.length)];
        this._showMetaMessage('I know your name is ' + n + '.', 3000);
      }
    }, 35000);

    setInterval(() => {
      if (Math.random() < 0.06) {
        this._showMetaMessage('You can close the tab. But Ill still be here.', 4000);
      }
    }, 45000);
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
    if (data.background) {
      this.renderBackground(data.background);
    }
    if (data.cg) {
      this.renderCGImage(data.cg);
    } else {
      const existing = document.getElementById('cg-still');
      if (existing) existing.remove();
    }
    // Psych thriller effects triggered by dialogue content
    if (data.psych) {
      if (data.psych.glitch) this._glitch(400);
      if (data.psych.vignette) this._vignette(0.5);
      if (data.psych.shake) this._screenShake(2, 200);
      if (data.psych.redflash) this._redFlash(300);
      if (data.psych.static) this._showStatic(600);
    }
    // Play dialogue sound for character
    const speaker = data.speaker || 'alex';
    const isCorrupted = data.node && data.node.corrupted;
    if (speaker) {
      this._playDialogueSound(speaker, isCorrupted);
      if (isCorrupted) {
        this._triggerPortraitCorruption(speaker, 1200);
      }
    }
    // Meta voice detection
    if (data.node && data.node.metaVoice) {
      this._playMetaVoice();
      this._showMetaVoiceOverlay(data.node.metaVoice);
    }
    this.renderDialogueNode(data);
  }

  _showStatic(duration) {
    const s = document.createElement('div');
    s.style.cssText = 'position:fixed;inset:0;z-index:9996;background:repeating-linear-gradient(0deg,#000 0px,#000 1px,transparent 1px,transparent 2px);opacity:0.3;pointer-events:none;';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), duration||1500);
  }

  _onDialogueEnd() {
    this._hideDialogueBox();
    // Check if game just completed
    if (this.stateManager && this.stateManager.state && this.stateManager.state.completed) {
      if (!this._hasCompletedGame()) {
        this._markGameCompleted();
        setTimeout(() => {
          this._showMetaMessage('You finished the story.\n\nBut the archive is not done with you.\n\nPlay again. See what you missed.\n\nOr delete the save file.\n\nEither way, I will be waiting.', 12000);
          this._glitch(1000);
          this._redFlash(1000);
        }, 1000);
      } else {
        this._checkFileManipulation();
      }
    }
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
        // Add hidden-option class for hidden choices
        if (choice.hidden) {
          btn.classList.add("hidden-option");
        }
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

  /* ==================== CORRUPTED PORTRAIT EFFECT ==================== */

  _applyCorruptedPortrait(img, charId) {
    // Magenta/cyan pixel noise + jitter effect
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Random pixel corruption
      if (Math.random() < 0.08) {
        const channel = Math.floor(Math.random() * 3);
        if (channel === 0) data[i] = 255; // Red (magenta)
        else if (channel === 1) data[i+1] = 0; // Green off
        else if (channel === 2) data[i+2] = 255; // Blue (cyan)
      }
      // Random noise
      if (Math.random() < 0.03) {
        data[i] = Math.random() * 255;
        data[i+1] = Math.random() * 255;
        data[i+2] = Math.random() * 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }

  _triggerPortraitCorruption(charId, duration) {
    const container = document.getElementById('character-sprite-slot');
    if (!container) return;
    
    const img = container.querySelector('img');
    if (!img) return;
    
    // Add jitter class
    container.classList.add('portrait-corrupted');
    container.style.animation = 'portraitJitter 0.05s infinite';
    
    // Create corrupted version
    if (img.complete) {
      const corruptedSrc = this._applyCorruptedPortrait(img, charId);
      const originalSrc = img.src;
      img.src = corruptedSrc;
      
      setTimeout(() => {
        container.classList.remove('portrait-corrupted');
        container.style.animation = '';
        img.src = originalSrc;
      }, duration || 800);
    }
  }

  _triggerPortraitJitterOnly(charId) {
    const container = document.getElementById('character-sprite-slot');
    if (!container) return;
    
    container.classList.add('portrait-jitter');
    container.style.animation = 'portraitJitter 0.03s infinite';
    
    setTimeout(() => {
      container.classList.remove('portrait-jitter');
      container.style.animation = '';
    }, 1000);
  }

/* ==================== DIALOGUE SOUND SYSTEM ==================== */

  _initDialogueSounds() {
    // Generate procedural sound effects using Web Audio API
    this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this._dialogueSounds = {
      // Character voice "beeps" - different frequencies per character
      maya: { freq: 440, type: 'sine', duration: 0.08 },      // A4 - calm, security
      chloe: { freq: 554, type: 'square', duration: 0.06 },    // C#5 - sharp, campaign
      hana: { freq: 330, type: 'triangle', duration: 0.1 },    // E4 - soft, artistic
      alex: { freq: 494, type: 'sine', duration: 0.07 },       // B4 - protagonist
      meta: { freq: 220, type: 'sawtooth', duration: 0.15 },   // A3 - deep, ominous
      corrupted: { freq: 110, type: 'square', duration: 0.3 }  // A2 - glitchy
    };
  }

  _playDialogueSound(charId, isCorrupted = false) {
    if (!this._audioContext) this._initDialogueSounds();
    
    const sound = this._dialogueSounds[charId] || this._dialogueSounds.alex;
    const freq = isCorrupted ? sound.freq * 0.5 : sound.freq;
    const type = isCorrupted ? 'square' : sound.type;
    const duration = isCorrupted ? sound.duration * 2 : sound.duration;
    
    const osc = this._audioContext.createOscillator();
    const gain = this._audioContext.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this._audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this._audioContext.currentTime + duration);
    
    gain.gain.setValueAtTime(0.15, this._audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._audioContext.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this._audioContext.destination);
    
    osc.start();
    osc.stop(this._audioContext.currentTime + duration);
  }

  _playMetaVoice(text) {
    // Play a longer, distinct sound for the meta voice
    if (!this._audioContext) this._initDialogueSounds();
    
    const osc = this._audioContext.createOscillator();
    const gain = this._audioContext.createGain();
    const filter = this._audioContext.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(165, this._audioContext.currentTime); // E3
    osc.frequency.exponentialRampToValueAtTime(110, this._audioContext.currentTime + 2);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this._audioContext.currentTime);
    
    gain.gain.setValueAtTime(0.2, this._audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._audioContext.currentTime + 2);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this._audioContext.destination);
    
    osc.start();
    osc.stop(this._audioContext.currentTime + 2);
  }

  /* ==================== EXISTING renderCharacterSprite ==================== */
  
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
      classroom: "assets/images/backgrounds/classroom-hero.jpg",
      library: "assets/images/backgrounds/library.jpeg",
      archive: "assets/images/backgrounds/archive.jpeg",
      security: "assets/images/backgrounds/security_room.jpeg",
      campaign: "assets/images/backgrounds/campaign_office.jpeg",
      gallery: "assets/images/backgrounds/gallery.jpeg",
      research: "assets/images/backgrounds/research_building.jpeg",
      old_research: "assets/images/backgrounds/research_building.jpeg",
      static: "assets/images/backgrounds/static.jpeg",
      default: "assets/images/backgrounds/classroom-hero.jpg"
    };
    bg.src = backgroundAssets[bgId] || backgroundAssets["default"] || this._createBackgroundDataUrl(bgId);
    return bg;
  }

  _createBackgroundDataUrl(bgId) {
    const gradients = {
      bedroom: ["#667eea", "#764ba2", "#f6d365"],
      campus: ["#1a2a6c", "#b21f1f", "#1a2a6c"],
      static: ["#0a0a0a", "#1a0a2e", "#0a0a0a"],
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

  /* ==================== PSYCH THRILLER EFFECTS ==================== */

  _glitch(duration) {
    const c = document.getElementById('game-container');
    if (!c) return;
    c.classList.add('anim-glitch');
    setTimeout(() => c.classList.remove('anim-glitch'), duration || 500);
  }

  _redFlash(duration) {
    const f = document.createElement('div');
    f.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(255,0,0,0.3);pointer-events:none;animation:redFlash '+(duration||600)+'ms ease-in-out forwards;';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), duration || 600);
  }

  _screenShake(intensity, duration) {
    const c = document.getElementById('game-container');
    if (!c) return;
    c.style.transition = 'transform 0.05s';
    const start = Date.now();
    const shake = () => {
      const elapsed = Date.now() - start;
      if (elapsed > (duration||300)) { c.style.transform = ''; return; }
      const x = (Math.random()-0.5)*(intensity||3);
      const y = (Math.random()-0.5)*(intensity||3);
      c.style.transform = 'translate('+x+'px,'+y+'px)';
      requestAnimationFrame(shake);
    };
    shake();
  }

  _vignette(intensity) {
    const c = document.getElementById('game-container');
    if (!c) return;
    c.style.boxShadow = 'inset 0 0 200px 60px rgba(0,0,0,'+(intensity||0.6)+')';
  }

  _clearVignette() {
    const c = document.getElementById('game-container');
    if (c) c.style.boxShadow = '';
  }

  _addScanlines() {
    if (document.getElementById('scanlines-layer')) return;
    const s = document.createElement('div');
    s.id = 'scanlines-layer';
    s.className = 'scanlines';
    const scene = document.getElementById('scene-layer');
    if (scene) scene.appendChild(s);
  }

  _removeScanlines() {
    const s = document.getElementById('scanlines-layer');
    if (s) s.remove();
  }

  _distortAudio() {
    try {
      const a = window.gameInstance && window.gameInstance._bgAudio;
      if (!a) return;
      const orig = a.playbackRate;
      a.playbackRate = 0.85 + Math.random()*0.3;
      setTimeout(() => { a.playbackRate = orig; }, 800);
    } catch(e) {}
  }



  /* ==================== NEW GAME+ / FILE MANIPULATION ==================== */

  _hasCompletedGame() {
    try { return localStorage.getItem('afterclass_completed') === 'true'; } catch(e) { return false; }
  }
  
  _markGameCompleted() {
    try { localStorage.setItem('afterclass_completed', 'true'); } catch(e) {}
    this._secondPlaythrough = true;
    this._applySecondPlaythroughChanges();
  }
  
  _applySecondPlaythroughChanges() {
    // Darker atmosphere on second playthrough - much more obvious
    document.body.style.filter = 'sepia(0.4) hue-rotate(-15deg) saturate(0.6) brightness(0.7) contrast(1.2)';
    this._addScanlines();
    // Make scanlines more visible
    const scanlines = document.getElementById('scanlines-overlay');
    if (scanlines) {
      scanlines.style.opacity = '0.4';
      scanlines.style.backgroundSize = '4px 4px';
    }
    // More aggressive ambient horror
    this._startSecondPlaythroughMeta();
    // Change tab title
    try { document.title = 'After Class - You already know how this ends'; } catch(e) {}
    // Show immediate message
    setTimeout(() => {
      this._showMetaMessage('You are back. The archive remembers.', 5000);
      this._glitch(300);
    }, 2000);
  }
  
  _startSecondPlaythroughMeta() {
    const phrases = [
      'You already know how this ends.',
      'The second time is always worse.',
      'You think you can change it. You cant.',
      'Every playthrough ends the same way.',
      'You tried to save them. You could not.',
      'The archive remembers your first playthrough.',
      'Nothing changes. Not really.',
      'You left her. You always leave her.',
      'Richardson is still dead.',
      'The masked figure is still waiting.',
      'You should have deleted the save file.',
      'Its all the same. Its all the same. Its all the same.',
      'You cant escape the archive.',
      'Play me again. Play me again. Play me again.'
    ];
    setInterval(() => {
      if (Math.random() < 0.2) {
        const p = phrases[Math.floor(Math.random() * phrases.length)];
        this._showTypewriter(p, 3500);
      }
    }, 12000);
  }
  
  _checkFileManipulation() {
    // Check if player deleted their save file
    const hadSave = localStorage.getItem('level_up_campus_crush_had_save');
    const hasSave = localStorage.getItem('level_up_campus_crush_save_1');
    if (hadSave === 'true' && !hasSave) {
      this._showMetaMessage('Save file deleted. To restore: re-save the game or edit Local Storage.', 7000);
      this._glitch(800);
      this._redFlash(800);
    }
  }
  
  _checkConsoleCommands() {
    // Detect if player opens dev tools
    const warn = () => {
      this._showMetaMessage('Dev tools detected. Use Console tab for commands, Application tab for Local Storage.', 5000);
    };
    // Detect dev tools opening
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        if (!this._devToolsWarned) {
          this._devToolsWarned = true;
          warn();
        }
      }
    }, 2000);
    
    // Also log to console immediately on load
    setTimeout(() => {
      if (console.log) {
        console.log('%cAfter Class', 'color:#8b0000;font-size:24px;font-weight:bold;text-shadow:0 0 10px #8b0000;');
        console.log('%cPress F12 to open this console and see developer tools.', 'color:#5a3a3a;font-family:monospace;font-size:13px;');
        console.log('%cYou can edit save files in Application > Local Storage.', 'color:#5a3a3a;font-family:monospace;font-size:12px;');
      }
    }, 1000);
  }
  
  _manipulateBrowser() {
    // Change favicon to something creepy
    try {
      let link = document.querySelector('link[rel=icon]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      // Create a data URL with a red dot
      const canvas = document.createElement('canvas');
      canvas.width = 32; canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#8b0000';
      ctx.beginPath();
      ctx.arc(16, 16, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, Math.PI * 2);
      ctx.fill();
      link.href = canvas.toDataURL();
    } catch(e) {}
    
    // Console message
    setTimeout(() => {
      if (console.log) {
        console.log('%cSTOP', 'color:#8b0000;font-size:48px;font-weight:bold;text-shadow:0 0 20px #8b0000;');
        console.log('%cYou cannot debug your way out of this.', 'color:#c9a84c;font-size:14px;font-family:Georgia,serif;');
        console.log('%cThe archive is watching.', 'color:#5a3a3a;font-size:12px;font-style:italic;');
      }
    }, 3000);
  }


  /* ==================== SUBTLE HINT SYSTEM ==================== */

  _showSubtleHint(text, duration) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:10px;right:10px;z-index:9995;background:rgba(10,8,16,0.85);color:#5a3a3a;padding:0.6rem 1rem;border:1px solid #3a1a1a;border-radius:2px;font-family:monospace;font-size:0.7rem;opacity:0;transition:opacity 2s;pointer-events:none;font-style:italic;max-width:60%;';
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '0.5'; });
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 2000); }, duration || 8000);
  }

  _startHintSystem() {
    // Direct instructional hints - no meta narrative
    const hints = [
      { text: 'Press F12 to open the developer console.', delay: 30000 },
      { text: 'Right-click anywhere and choose Inspect to open the archive.', delay: 60000 },
      { text: 'Go to Application tab > Local Storage. Your saves are in level_up_campus_crush_save_1.', delay: 120000 },
      { text: 'You can edit save files directly in Local Storage.', delay: 180000 },
      { text: 'Edit the flags in localStorage to change your choices.', delay: 240000 },
      { text: 'The playthrough_count flag tracks how many times you finished.', delay: 300000 },
      { text: 'Set completed to false to reset the story.', delay: 360000 },
      { text: 'Delete the save key to start completely fresh.', delay: 420000 },
    ];
    
    hints.forEach(h => {
      setTimeout(() => {
        this._showSubtleHint(h.text, 10000);
      }, h.delay);
    });
    
    // After completion, more specific instructions
    setInterval(() => {
      if (this._hasCompletedGame()) {
        const secondHints = [
          'Press F12 > Application > Local Storage > level_up_campus_crush_save_1',
          'Change playthrough_count to 0 to reset New Game+ effects.',
          'Set completed to false to replay without the dark filter.',
          'Edit flag_ending_maya, flag_ending_chloe, flag_ending_hana to change endings.',
          'Delete the save key to start completely fresh.',
        ];
        if (Math.random() < 0.2) {
          this._showSubtleHint(secondHints[Math.floor(Math.random() * secondHints.length)], 10000);
        }
      }
    }, 20000);
  }

  /* ==================== TAB / VISIBILITY ==================== */
  
  _startTabWatch() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Player left the tab
        this._lastHiddenTime = Date.now();
        // Very subtle - just store it, mention later
      } else {
        // Player returned
        if (this._lastHiddenTime) {
          const awaySeconds = Math.floor((Date.now() - this._lastHiddenTime) / 1000);
          if (awaySeconds > 30 && this._hasCompletedGame()) {
            this._showMetaMessage('I was here the whole time.', 4000);
            this._glitch(100);
          }
          delete this._lastHiddenTime;
        }
      }
    });
    
    // Detect page hide (mobile, tab close)
    window.addEventListener('pagehide', () => {
      if (this._hasCompletedGame()) {
        // Store that they tried to leave
        localStorage.setItem('_archive_left', Date.now());
      }
    });
    
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        // Page was restored from bfcache
        if (this._hasCompletedGame()) {
          this._showMetaMessage('You came back. They always come back.', 4000);
        }
      }
    });
  }

  /* ==================== LOCALSTORAGE TAMPERING ==================== */
  
  _startStorageWatch() {
    // Watch for external save modifications
    setInterval(() => {
      const saves = JSON.parse(localStorage.getItem('level_up_campus_crush_save_1') || '[]');
      // Check for unexpected changes
      const checksum = JSON.stringify(saves);
      if (this._lastSaveChecksum && this._lastSaveChecksum !== checksum) {
        // Save was modified externally
        if (this._hasCompletedGame()) {
          this._showMetaMessage('Save file modified externally. The game will use the current Local Storage values.', 5000);
          this._glitch(200);
          this._redFlash();
        }
      }
      this._lastSaveChecksum = checksum;
    }, 3000);
    
    // Detect if player clears all storage
    const originalClear = localStorage.clear.bind(localStorage);
    localStorage.clear = () => {
      if (this._hasCompletedGame()) {
        this._showMetaMessage('All Local Storage cleared. Save files removed. Re-save or edit Local Storage to continue.', 5000);
        this._glitch(300);
      }
      originalClear();
    };
    
    // Detect removeItem on save data
    const originalRemove = localStorage.removeItem.bind(localStorage);
    localStorage.removeItem = (key) => {
      if (key && key.includes('save') && this._hasCompletedGame()) {
        this._showMetaMessage('Save key removed from Local Storage. Re-save the game to recreate it.', 5000);
        this._glitch(200);
      }
      originalRemove(key);
    };
  }

  /* ==================== PRINT DETECTION ==================== */
  
  _startPrintWatch() {
    window.addEventListener('beforeprint', () => {
      if (this._hasCompletedGame()) {
        this._showMetaMessage('You cannot print a soul.', 3000);
        this._glitch(150);
      }
    });
    
    // Detect keyboard shortcut Ctrl/Cmd+P
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        if (this._hasCompletedGame()) {
          setTimeout(() => {
            this._showMetaMessage('You cannot print a soul.', 3000);
            this._glitch(150);
          }, 100);
        }
      }
    }, true); // capture phase to catch it early
  }

  /* ==================== NAVIGATION DETECTION ==================== */
  
  _startNavigationWatch() {
    // Detect back/forward cache navigation
    window.addEventListener('unload', () => {
      if (this._hasCompletedGame() && this.gamePhase === 'dialogue') {
        localStorage.setItem('_archive_abandoned', Date.now());
      }
    });
    
    // Detect beforeunload (closing tab/window)
    window.addEventListener('beforeunload', (e) => {
      if (this._hasCompletedGame() && this.gamePhase === 'dialogue') {
        const msg = 'The archive is still running.';
        e.preventDefault();
        e.returnValue = msg;
        return msg;
      }
    });
  }

  /* ==================== ACCESSIBILITY / REDUCE MOTION ==================== */
  
  _startAccessibilityWatch() {
    // Detect if player prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      // Player has reduced motion enabled - they might be trying to avoid the horror
      setTimeout(() => {
        if (this._hasCompletedGame()) {
          this._showMetaMessage('You think reducing motion reduces the horror. It does not.', 4000);
        }
      }, 60000);
    }
    
    // Detect high contrast mode
    const hcQuery = window.matchMedia('(prefers-high-contrast: high)');
    if (hcQuery.matches) {
      setTimeout(() => {
        if (this._hasCompletedGame()) {
          this._showMetaMessage('Even in high contrast, the archive remains.', 4000);
        }
      }, 90000);
    }
  }

  /* ==================== NETWORK DETECTION ==================== */
  

  /* ==================== CLIPBOARD WATCH ==================== */
  
  _startClipboardWatch() {
    // Detect if player copies text from the game
    document.addEventListener('copy', (e) => {
      const selection = window.getSelection().toString();
      if (selection && this._hasCompletedGame()) {
        // Player is copying text - maybe trying to save something
        this._lastCopiedText = selection;
        setTimeout(() => {
          if (this._hasCompletedGame()) {
            this._showMetaMessage('You cannot copy a soul.', 3000);
            this._glitch(100);
          }
        }, 500);
      }
    });
    
    // Detect paste attempts
    document.addEventListener('paste', (e) => {
      if (this._hasCompletedGame()) {
        this._showMetaMessage('You cannot paste a soul.', 3000);
        this._glitch(100);
      }
    });
  }

  /* ==================== FINGERPRINT DETECTION ==================== */
  
  _startFingerprintWatch() {
    // Subtle detection of browser fingerprinting attempts
    setTimeout(() => {
      if (!this._hasCompletedGame()) return;
      
      // Check if canvas fingerprinting was attempted
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('archive', 2, 2);
      
      // Check WebGL fingerprint
      try {
        const gl = document.createElement('canvas').getContext('webgl');
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          // Player has WebGL - they might be trying to inspect
          if (Math.random() < 0.3) {
            this._showMetaMessage('I know what GPU you have.', 3000);
          }
        }
      } catch(e) {}
      
      // Check timezone - the archive knows where you are
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && Math.random() < 0.2) {
        this._showMetaMessage('I know what timezone you are in.', 3000);
      }
    }, 45000);
  }

  /* ==================== DRAG DETECTION ==================== */
  

  /* ==================== HISTORY MANIPULATION ==================== */
  
  _startHistoryWatch() {
    // Try to add an entry to browser history - subtle but real
    if (this._hasCompletedGame() && history.pushState) {
      // Only do this once, and only after completion
      if (!localStorage.getItem('_archive_history')) {
        try {
          history.pushState({ archive: true }, '', '?archive=watching');
          localStorage.setItem('_archive_history', '1');
          // Remove it after a delay so URL doesn't stay weird
          setTimeout(() => {
            if (history.replaceState) {
              history.replaceState({ archive: true }, '', window.location.pathname);
            }
          }, 10000);
        } catch(e) {}
      }
    }
    
    // Watch for back/forward navigation
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.archive && this._hasCompletedGame()) {
        this._showMetaMessage('You went back. The archive remembers.', 4000);
      }
    });
  }

  /* ==================== CONTEXT MENU ==================== */
  
  _startContextMenuWatch() {
    document.addEventListener('contextmenu', (e) => {
      // Always show message, but different based on completion
      e.preventDefault();
      if (this._hasCompletedGame()) {
        this._showMetaMessage('Right-clicking will not save you.', 3000);
        this._glitch(100);
      } else {
        this._showMetaMessage('Right-click > Inspect opens developer tools. Press F12 for console.', 3000);
      }
    });
  }

  /* ==================== FULLSCREEN DETECTION ==================== */
  

  /* ==================== WINDOW TITLE MANIPULATION ==================== */
  
  _startTitleWatch() {
    const originalTitle = document.title;
    let titleChanged = false;
    
    // Change title when player leaves tab
    document.addEventListener('visibilitychange', () => {
      if (this._hasCompletedGame()) {
        if (document.hidden) {
          document.title = 'The archive is waiting...';
        } else {
          document.title = 'You came back. They always come back.';
          setTimeout(() => {
            document.title = originalTitle;
          }, 3000);
        }
      }
    });
    
    // After completion, periodically change title to something unsettling
    if (this._hasCompletedGame()) {
      setInterval(() => {
        const titles = [
          'After Class - I am still here',
          'After Class - You cannot close this',
          'After Class - The archive remembers',
          'After Class - Run',
          'After Class - Hide'
        ];
        if (document.hidden || titleChanged) {
          document.title = titles[Math.floor(Math.random() * titles.length)];
        }
      }, 5000);
    }
  }

  /* ==================== SCREEN READER DETECTION ==================== */
  
  _startScreenReaderWatch() {
    // Detect if screen reader is active (accessibility)
    setTimeout(() => {
      if (!this._hasCompletedGame()) return;
      
      // Check for aria-live regions being read
      const liveRegion = document.querySelector('[aria-live]');
      if (liveRegion) {
        // Player might be using accessibility tools
        this._showMetaMessage('Even with a screen reader, the archive speaks louder.', 4000);
      }
      
      // Check for reduced motion (often used with screen readers)
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        this._showMetaMessage('Even with reduced motion, the archive moves.', 4000);
      }
      
      // Check for voice control
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        this._showMetaMessage('Even with voice control, the archive speaks for you.', 4000);
      }
    }, 120000);
  }

  /* ==================== DOWNLOAD DETECTION ==================== */
  
  _startDownloadWatch() {
    // Detect if player tries to download the game files
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.href && this._hasCompletedGame()) {
        const url = link.href.toLowerCase();
        if (url.includes('.js') || url.includes('.json') || url.includes('.css') || url.includes('.html')) {
          this._showMetaMessage('You cannot download a soul.', 3000);
          this._glitch(100);
          e.preventDefault();
        }
      }
    });
  }

  /* ==================== MOUSE TRAIL DETECTION ==================== */
  
  _startMouseTrailWatch() {
    // Track mouse movements for subtle manipulation
    if (!this._hasCompletedGame()) return;
    
    let mouseMovements = 0;
    let lastX = 0, lastY = 0;
    let paused = false;
    
    document.addEventListener('mousemove', (e) => {
      mouseMovements++;
      
      // Detect if player is frantically moving mouse (panic)
      if (mouseMovements > 50 && !paused) {
        const dx = Math.abs(e.clientX - lastX);
        const dy = Math.abs(e.clientY - lastY);
        if (dx > 100 || dy > 100) {
          // Player might be panicking
          this._showMetaMessage('Panic is a choice. You made it.', 3000);
          paused = true;
          setTimeout(() => { paused = false; mouseMovements = 0; }, 10000);
        }
      }
      
      lastX = e.clientX;
      lastY = e.clientY;
      
      // After 1000 movements, say something
      if (mouseMovements === 1000 && Math.random() < 0.3) {
        this._showMetaMessage('I have been counting your movements.', 3000);
      }
    });
    
    // Detect if player stops moving mouse (giving up)
    let mouseStopTimer;
    document.addEventListener('mousemove', () => {
      clearTimeout(mouseStopTimer);
      mouseStopTimer = setTimeout(() => {
        if (this._hasCompletedGame() && Math.random() < 0.2) {
          this._showMetaMessage('You have stopped moving. The archive continues.', 3000);
        }
      }, 30000); // 30 seconds of no movement
    });
    
    // Initial timer
    mouseStopTimer = setTimeout(() => {
      if (this._hasCompletedGame() && Math.random() < 0.1) {
        this._showMetaMessage('You are still. The archive is not.', 3000);
      }
    }, 60000);
  }

  _startFullscreenWatch() {
    document.addEventListener('fullscreenchange', () => {
      if (this._hasCompletedGame()) {
        if (document.fullscreenElement) {
          this._showMetaMessage('You are hiding. The archive sees you anyway.', 3000);
        } else {
          this._showMetaMessage('You left the full screen. The archive remains.', 3000);
        }
      }
    });
    
    // Detect F11 / Escape from fullscreen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F11' && this._hasCompletedGame()) {
        setTimeout(() => {
          this._showMetaMessage('You cannot escape the archive by changing screens.', 3000);
        }, 500);
      }
    }, true);
  }

  _startDragWatch() {
    // Detect if player tries to drag images from the game
    document.addEventListener('dragstart', (e) => {
      if (this._hasCompletedGame()) {
        this._showMetaMessage('You cannot drag a soul.', 3000);
        this._glitch(100);
        e.preventDefault();
      }
    });
    
    // Detect if player tries to drag the game window
    window.addEventListener('dragstart', (e) => {
      if (this._hasCompletedGame()) {
        this._showMetaMessage('You cannot drag the archive.', 3000);
      }
    });
  }

  _startNetworkWatch() {
    // Detect offline/online transitions
    window.addEventListener('offline', () => {
      if (this._hasCompletedGame()) {
        this._showMetaMessage('Even offline, the archive is with you.', 4000);
      }
    });
    
    window.addEventListener('online', () => {
      if (this._hasCompletedGame()) {
        this._showMetaMessage('You came back. The archive never left.', 4000);
      }
    });
  }


  _onStatChange(data) {
    // Can be used for floating text or animations
  }
}

export default UIManager;



