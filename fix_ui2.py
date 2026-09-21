import re

content = open('src/systems/UIManager.js').read()

# Replace the entire backgroundAssets block
start = content.find('const backgroundAssets')
end = content.find('};', start) + 2

new_block = '''const backgroundAssets = {
      bedroom: "assets/images/backgrounds/bedroom.png",
      campus: "assets/images/backgrounds/campus.png",
      university: "assets/images/backgrounds/classroom-hero.jpg",
      library: "assets/images/backgrounds/classroom-hero.jpg",
      archive: "assets/images/backgrounds/classroom-hero.jpg",
      default: "assets/images/backgrounds/classroom-hero.jpg"
    };'''

content = content[:start] + new_block + content[end:]

# Fix portrait paths - they should already be correct but verify
# Also fix _getCharacterName to remove riley/emma
content = content.replace('riley: "Riley", emma: "Emma"', '')
content = content.replace('riley: "#ffb74d", emma: "#ce93d8"', '')

open('src/systems/UIManager.js','w').write(content)
print('Fixed UIManager.js')