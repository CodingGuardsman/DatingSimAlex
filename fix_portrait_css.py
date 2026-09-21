content = open('src/systems/UIManager.js').read()
old = '''    const img = new Image(); img.onload = () => {
      // Cache the loaded image
      this._portraitCache[charId] = img.cloneNode(true);
      const clone = this._portraitCache[charId].cloneNode(true);
      clone.style.cssText = "width:100%;height:100%;object-fit:cover;position:absolute;inset:0;";
      container.appendChild(clone);
    };
    img.onerror = () => {
      const fallback = document.createElement("div");
      fallback.textContent = label[0];
      fallback.style.cssText = "width:120px;height:120px;border-radius:50%;background:" + bgColor + ";display:flex;align-items:center;justify-content:center;color:#fff;font-size:3rem;font-weight:bold;";
      container.appendChild(fallback);
    };
    img.src = portraitPath;'''
new = '''    const img = new Image(); img.onload = () => {
      this._portraitCache[charId] = img.cloneNode(true);
      const clone = this._portraitCache[charId].cloneNode(true);
      clone.style.cssText = "width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border:3px solid rgba(201,168,76,0.6);border-radius:8px;box-shadow:0 0 40px rgba(0,0,0,0.5);";
      container.appendChild(clone);
    };
    img.onerror = () => {
      const fallback = document.createElement("div");
      fallback.textContent = label[0];
      fallback.style.cssText = "width:120px;height:120px;border-radius:50%;background:" + bgColor + ";display:flex;align-items:center;justify-content:center;color:#fff;font-size:3rem;font-weight:bold;border:3px solid rgba(201,168,76,0.6);";
      container.appendChild(fallback);
    };
    img.src = portraitPath;'''
content = content.replace(old, new)
open('src/systems/UIManager.js','w').write(content)
print('Fixed portrait styling')