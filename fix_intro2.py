content = open('src/main.js').read()
old = 'case "prologue":'
idx = content.find(old)
end = content.find('break;', idx) + 6
insert = '\n      case "intro":\n        this.dialogueSystem.startDialogue("prologue");\n        break;'
content = content[:end] + insert + content[end:]
open('src/main.js','w').write(content)
print('Added intro -> prologue transition')