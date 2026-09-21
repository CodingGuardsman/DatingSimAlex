
  /* PSYCH THRILLER EFFECTS */
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
  _showWhisper(text, duration) {
    const w = document.createElement('div');
    w.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9997;font-family:Georgia,serif;font-size:1.4rem;color:#8b0000;text-shadow:0 0 20px rgba(139,0,0,0.8);opacity:0;transition:opacity 1s;pointer-events:none;text-align:center;max-width:80%;line-height:1.6;font-style:italic;';
    w.textContent = text;
    document.body.appendChild(w);
    requestAnimationFrame(() => { w.style.opacity = '0.85'; });
    setTimeout(() => { w.style.opacity = '0'; setTimeout(() => w.remove(), 1000); }, duration||3000);
  }
  _showStatic(duration) {
    const s = document.createElement('div');
    s.style.cssText = 'position:fixed;inset:0;z-index:9996;background:repeating-linear-gradient(0deg,#000 0px,#000 1px,transparent 1px,transparent 2px);opacity:0.3;pointer-events:none;';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), duration||1500);
  }

