content = open('src/main.js').read()
old = 'this.stateManager.getFlag("ending_maya")'
new = 'this.stateManager.getFlag("flag_ending_maya")'
content = content.replace(old, new)
old2 = 'this.stateManager.getFlag("ending_chloe")'
new2 = 'this.stateManager.getFlag("flag_ending_chloe")'
content = content.replace(old2, new2)
old3 = 'this.stateManager.getFlag("ending_hana")'
new3 = 'this.stateManager.getFlag("flag_ending_hana")'
content = content.replace(old3, new3)
open('src/main.js','w').write(content)
print('Updated flag prefixes')