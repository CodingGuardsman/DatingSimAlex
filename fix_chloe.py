content = open('src/systems/UIManager.js').read()

# Fix Chloe smiling to use the clean anime-xl JPEG
content = content.replace(
    'smiling: "assets/images/characters/chloe/smilingchloe.png"',
    'smiling: "assets/images/characters/chloe/chloe_smiling.jpg"'
)

# Zoom out portraits to 55% and brighten
old = 'width:70%;height:70%;object-fit:cover;position:absolute;inset:0;margin:auto;border:3px solid rgba(201,168,76,0.8);border-radius:8px;box-shadow:0 0 60px rgba(0,0,0,0.7);filter:brightness(1.15) contrast(1.05) saturate(1.1);'
new = 'width:55%;height:55%;object-fit:cover;position:absolute;inset:0;margin:auto;border:3px solid rgba(201,168,76,0.85);border-radius:8px;box-shadow:0 0 80px rgba(0,0,0,0.8);filter:brightness(1.2) contrast(1.1) saturate(1.15);'
content = content.replace(old, new)

open('src/systems/UIManager.js','w').write(content)
print('Fixed Chloe smiling and portrait size')