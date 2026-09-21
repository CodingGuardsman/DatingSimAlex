import re

content = open('src/systems/UIManager.js').read()

# Fix _getCharacterName to remove riley/emma
content = content.replace('riley: "Riley", emma: "Emma"', '')
content = content.replace('riley: "#ffb74d", emma: "#ce93d8"', '')

# Standardize colors across the file
content = content.replace('border: 2px solid rgba(216, 102, 125, 0.9);', 'border: 2px solid rgba(201, 168, 76, 0.8);')
content = content.replace('background: linear-gradient(180deg, #fffaf7 0%, #f6dfe4 100%);', 'background: linear-gradient(180deg, #1a1525 0%, #251d35 100%);')
content = content.replace('background: linear-gradient(180deg, #ffedf0 0%, #f7bdd0 100%);', 'background: linear-gradient(180deg, #2a2040 0%, #352850 100%);')
content = content.replace('box-shadow: 0 6px 0 rgba(187, 119, 134, 0.45);', 'box-shadow: 0 6px 0 rgba(100, 80, 120, 0.5);')
content = content.replace('box-shadow: 0 8px 0 rgba(187, 119, 134, 0.45);', 'box-shadow: 0 8px 0 rgba(100, 80, 120, 0.5);')
content = content.replace('box-shadow: 0 2px 0 rgba(187, 119, 134, 0.45);', 'box-shadow: 0 2px 0 rgba(100, 80, 120, 0.5);')
content = content.replace('background: rgba(255, 220, 229, 0.38);', 'background: rgba(201, 168, 76, 0.15);')
content = content.replace('background: rgba(0,0,0,0.55);', 'background: rgba(0,0,0,0.6);')
content = content.replace('color: #fff;', 'color: #e8e0d0;')

# Standardize save slot colors
content = content.replace('border: 2px solid rgba(216, 102, 125, 0.9);', 'border: 2px solid rgba(201, 168, 76, 0.8);')
content = content.replace('background: linear-gradient(180deg, #fffaf7 0%, #f8efe6 100%);', 'background: linear-gradient(180deg, #1a1525 0%, #251d35 100%);')
content = content.replace('background: rgba(255, 220, 229, 0.38);', 'background: rgba(201, 168, 76, 0.15);')

# Standardize stat colors
content = content.replace('color: #a0a0b0;', 'color: #b0a8c0;')

# Standardize overlay font
content = content.replace('textEl.style.color = "#fff";', 'textEl.style.color = "#e8e0d0";')
content = content.replace('textEl.style.fontSize = "1.8rem";', 'textEl.style.fontSize = "1.8rem"; textEl.style.fontFamily = "Georgia, serif";')

open('src/systems/UIManager.js','w').write(content)
print('UIManager.js standardized')