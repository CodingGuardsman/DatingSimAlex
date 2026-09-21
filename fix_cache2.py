content = open('src/systems/UIManager.js').read()

# Fix cache key to include expression
content = content.replace(
    '_portraitCache[charId]',
    '_portraitCache[charId + "_" + expression]'
)
content = content.replace(
    'if (this._portraitCache[charId]) {',
    'if (this._portraitCache[charId + "_" + expression]) {'
)
content = content.replace(
    'this._portraitCache[charId] = img.cloneNode(true);',
    'this._portraitCache[charId + "_" + expression] = img.cloneNode(true);'
)

open('src/systems/UIManager.js','w').write(content)

# Verify
content2 = open('src/systems/UIManager.js').read()
if 'charId + "_" + expression' in content2:
    print('VERIFIED: cache key now includes expression')
else:
    print('FAILED: cache key still old')