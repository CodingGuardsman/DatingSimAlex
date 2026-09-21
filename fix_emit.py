content = open('src/systems/DialogueSystem.js').read()
old = '''  _emitNode(node) {
    const choices = this._getAvailableChoices(node);
    this.eventBus.emit(EVENTS.DIALOGUE_ADVANCE, {
      node,
      speaker: node.speaker || null,
      text: node.text || "",
      expression: node.expression || "neutral",
      choices: choices,
      isEnd: node.isEnd || false,
      characterId: node.character || null
    });
  }'''
new = '''  _emitNode(node) {
    const choices = this._getAvailableChoices(node);
    this.eventBus.emit(EVENTS.DIALOGUE_ADVANCE, {
      node,
      speaker: node.speaker || null,
      text: node.text || "",
      expression: node.expression || "neutral",
      choices: choices,
      isEnd: node.isEnd || false,
      characterId: node.character || null,
      cg: node.cg || null,
      background: node.background || this._treeBackground || null
    });
  }'''
content = content.replace(old, new)

# Add _treeBackground tracking
old2 = 'startDialogue(dialogueId, startNodeId = null) {'
new2 = '''  startDialogue(dialogueId, startNodeId = null) {
    this._treeBackground = (this.dialogueData[dialogueId] || {}).background || null;'''
content = content.replace(old2, new2)

open('src/systems/DialogueSystem.js','w').write(content)
print('Added cg and background to emit')