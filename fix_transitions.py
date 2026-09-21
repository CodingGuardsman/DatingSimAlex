content = open('src/main.js').read()
old_start = content.find('  _handleDialogueEnd(data) {')
old_end = content.find('  _buildSlotList() {')
new_method = '''  _handleDialogueEnd(data) {
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

'''
content = content[:old_start] + new_method + content[old_end:]
open('src/main.js','w').write(content)
print('Added transition overlays')