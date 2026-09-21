content = open('src/main.js').read()
# Find the constructor and add _startBgMusic method right after it
old = '''    this._startBgMusic();
    this.sceneLayer = document.getElementById("scene-layer");'''
new = '''    this.sceneLayer = document.getElementById("scene-layer");
    this._startBgMusic();'''
content = content.replace(old, new)

# Now add the method definition after the constructor block
# Find the end of constructor (before init)
old2 = '''  async init() {'''
new2 = '''  _startBgMusic() {
    if (this._bgAudio && this._bgAudio.readyState > 0) {
      this._bgAudio.play().catch(e => console.warn("[Audio] Resume blocked:", e));
      return;
    }
    try {
      this._bgAudio = new Audio("src/audio/background.mp3");
      this._bgAudio.loop = true;
      this._bgAudio.volume = 0.3;
      this._bgAudio.play().catch(e => console.warn("[Audio] Autoplay blocked:", e));
    } catch(e) {
      console.warn("[Audio] Failed to load", e);
    }
  }

  async init() {'''
content = content.replace(old2, new2)

open('src/main.js','w').write(content)
print('Added _startBgMusic method to Game class')