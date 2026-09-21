content = open('src/main.js').read()
# Set window.gameInstance
content = content.replace(
    'constructor() {\n    this._bgAudio = null;\n    this._startBgMusic();',
    'constructor() {\n    this._bgAudio = null;\n    window.gameInstance = this;\n    this._startBgMusic();'
)
# Fix _startBgMusic to not recreate
old_music = '''  _startBgMusic() {
    try {
      this._bgAudio = new Audio('src/audio/background.mp3');
      this._bgAudio.loop = true;
      this._bgAudio.volume = 0.3;
      this._bgAudio.play().catch(e => console.warn('[Audio] Autoplay blocked:', e));
    } catch(e) {
      console.warn('[Audio] Failed to load', e);
    }
  }'''
new_music = '''  _startBgMusic() {
    if (this._bgAudio && this._bgAudio.readyState > 0) {
      this._bgAudio.play().catch(e => console.warn('[Audio] Resume blocked:', e));
      return;
    }
    try {
      this._bgAudio = new Audio('src/audio/background.mp3');
      this._bgAudio.loop = true;
      this._bgAudio.volume = 0.3;
      this._bgAudio.play().catch(e => console.warn('[Audio] Autoplay blocked:', e));
    } catch(e) {
      console.warn('[Audio] Failed to load', e);
    }
  }'''
content = content.replace(old_music, new_music)
open('src/main.js','w').write(content)
print('Fixed gameInstance and music resume')