content = open('src/systems/UIManager.js').read()

# Fix the caching to key by charId + expression
old_cache = '''    // Cache images to prevent flickering on every dialogue advance
    if (!this._portraitCache) this._portraitCache = {};
    if (this._portraitCache[charId]) {
      const cached = this._portraitCache[charId].cloneNode(true);
      cached.style.cssText = "width:100%;height:100%;object-fit:cover;position:absolute;inset:0;";
      container.appendChild(cached);
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Cache the loaded image
      this._portraitCache[charId] = img.cloneNode(true);
      container.innerHTML = "";
      img.alt = label;
      img.style.cssText = "width:100%;height:100%;object-fit:cover;position:absolute;inset:0;";
      container.appendChild(img);
    };
    img.onerror = () => {
      container.innerHTML = "";
      const fallback = document.createElement("div");
      fallback.textContent = label[0];
      fallback.style.cssText = "width:120px;height:120px;border-radius:50%;background:" + bgColor + ";display:flex;align-items:center;justify-content:center;color:#fff;font-size:3rem;font-weight:bold;";
      container.appendChild(fallback);
    };
    img.src = portraitPath;'''

new_cache = '''    // Cache images by charId + expression to allow expression changes
    if (!this._portraitCache) this._portraitCache = {};
    const cacheKey = charId + "_" + expression;
    if (this._portraitCache[cacheKey]) {
      const cached = this._portraitCache[cacheKey].cloneNode(true);
      cached.style.cssText = "width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border:3px solid rgba(201,168,76,0.6);border-radius:8px;box-shadow:0 0 40px rgba(0,0,0,0.5);";
      container.appendChild(cached);
      return;
    }

    const img = new Image();
    img.onload = () => {
      this._portraitCache[cacheKey] = img.cloneNode(true);
      container.innerHTML = "";
      img.alt = label;
      img.style.cssText = "width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border:3px solid rgba(201,168,76,0.6);border-radius:8px;box-shadow:0 0 40px rgba(0,0,0,0.5);";
      container.appendChild(img);
    };
    img.onerror = () => {
      container.innerHTML = "";
      const fallback = document.createElement("div");
      fallback.textContent = label[0];
      fallback.style.cssText = "width:120px;height:120px;border-radius:50%;background:" + bgColor + ";display:flex;align-items:center;justify-content:center;color:#fff;font-size:3rem;font-weight:bold;border:3px solid rgba(201,168,76,0.6);";
      container.appendChild(fallback);
    };
    img.src = portraitPath;'''

content = content.replace(old_cache, new_cache)

# Also fix the dead code: remove the duplicate if (!portraitPath) check
old_dead = '''    if (!portraitPath) return;
    if (!portraitPath) {'''
new_dead = '''    if (!portraitPath) {'''
content = content.replace(old_dead, new_dead)

open('src/systems/UIManager.js','w').write(content)
print('Fixed portrait caching - now keys by charId + expression')