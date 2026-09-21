import json
d = json.load(open('src/data/dialogues.json'))

bg_map = {
    'intro': 'university',
    'prologue': 'library',
    'chapter1_archive': 'archive',
    'chapter2_maya': 'security',
    'chapter3_chloe': 'campaign',
    'chapter4_hana': 'gallery',
    'day5_confrontation': 'research'
}

for tree_id, bg in bg_map.items():
    if tree_id in d:
        d[tree_id]['background'] = bg

# CG stills for key moments
d['prologue']['nodes']['note_examine']['cg'] = 'assets/images/characters/alex/move-the-character-to-a-library-scene--surrounded-.png'
d['chapter2_maya']['nodes']['maya_footage_play']['cg'] = 'assets/images/characters/maya/move-the-character-to-a-security-control-room--sea.png'
for nid in list(d['chapter4_hana']['nodes'].keys()):
    d['chapter4_hana']['nodes'][nid]['cg'] = 'assets/images/characters/hana/painintg.jpeg'
d['day5_confrontation']['nodes']['confront_start']['cg'] = 'assets/images/characters/conmfrontiation.jpeg'

json.dump(d, open('src/data/dialogues.json','w'), indent=2)
print('Backgrounds and CG stills wired')
for k in d:
    bg = d[k].get('background', 'none')
    print('  ' + k + ': bg=' + bg)