content = open('src/main.js').read()
content = content.replace(
    'this.dialogueSystem.startDialogue("prologue");',
    'this.dialogueSystem.startDialogue("intro");'
)
open('src/main.js','w').write(content)
print('Updated _startNewGame to start intro')