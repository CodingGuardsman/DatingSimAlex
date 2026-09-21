content = open('src/systems/UIManager.js').read()

# Update _onDialogueStart to use data background and CG
old_start = '''  _onDialogueStart(data) {
    // Hide any visible menus
    const menu = document.getElementById('menu-container');
    if (menu) menu.style.display = 'none';
    const saveMenu = document.getElementById('save-slots-container');
    if (saveMenu) saveMenu.style.display = 'none';
    
    this._showDialogueBox();
    // Set university background
    this.renderBackground('university');
    // Show centered character portrait
    if (data.node && data.node.speaker) {
      this.renderCharacterSprite(data.node.speaker, data.node.expression || 'neutral', 'center');
    }
  }'''
new_start = '''  _onDialogueStart(data) {
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
    if (data.node && data.node.speaker) {
      this.renderCharacterSprite(data.node.speaker, data.node.expression || 'neutral', 'center');
    }
  }'''
content = content.replace(old_start, new_start)

# Update _onDialogueAdvance to handle CG changes
old_adv = '''  _onDialogueAdvance(data) {
    if (!data || !data.node) return;
    this.renderDialogueNode(data);
  }'''
new_adv = '''  _onDialogueAdvance(data) {
    if (!data || !data.node) return;
    // Update CG if changed
    if (data.cg) {
      this.renderCGImage(data.cg);
    } else {
      const existing = document.getElementById('cg-still');
      if (existing) existing.remove();
    }
    this.renderDialogueNode(data);
  }'''
content = content.replace(old_adv, new_adv)

# Update renderDialogueNode to use expression-based portraits
old_render = '''    // Show centered character portrait
    if (speaker) {
      this.renderCharacterSprite(speaker, expression, "right");
    }'''
new_render = '''    // Show centered character portrait
    if (speaker) {
      this.renderCharacterSprite(speaker, expression, "center");
    }'''
content = content.replace(old_render, new_render)

open('src/systems/UIManager.js','w').write(content)
print('Updated dialogue handlers for backgrounds and CG stills')