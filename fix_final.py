content = open('src/systems/UIManager.js').read()

# Fix background paths (spaces in filenames break URLs)
content = content.replace('security contoro room.jpeg', 'security_room.jpeg')
content = content.replace('campagin office.jpeg', 'campaign_office.jpeg')
content = content.replace('gallery .jpeg', 'gallery.jpeg')
content = content.replace('old research builkding.jpeg', 'research_building.jpeg')

# Fix masked figure path
content = content.replace('maksed figure.jpeg', 'masked_figure.jpeg')

# Fix portrait size - zoom out to 70% and remove greyness
old_style = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border:3px solid rgba(201,168,76,0.6);border-radius:8px;box-shadow:0 0 40px rgba(0,0,0,0.5);'
new_style = 'width:70%;height:70%;object-fit:cover;position:absolute;inset:0;margin:auto;border:3px solid rgba(201,168,76,0.8);border-radius:8px;box-shadow:0 0 60px rgba(0,0,0,0.7);filter:brightness(1.15) contrast(1.05) saturate(1.1);'
content = content.replace(old_style, new_style)

open('src/systems/UIManager.js','w').write(content)
print('Fixed paths and portrait styling')