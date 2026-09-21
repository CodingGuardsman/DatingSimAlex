import os

rows = []

# Backgrounds
bg_map = [
    ('library.jpeg', 'Prologue'),
    ('archuive.jpeg', 'Archive'),
    ('security_room.jpeg', 'Maya'),
    ('campaign_office.jpeg', 'Chloe'),
    ('gallery.jpeg', 'Hana'),
    ('research_building.jpeg', 'Confrontation'),
    ('classroom-hero.jpg', 'Intro/Start'),
]
rows.append('<tr><th colspan="3" style="text-align:left;color:#c9a84c;">BACKGROUNDS</th></tr>')
for f, label in bg_map:
    rows.append('<tr><td>' + f + '</td><td><img src="assets/images/backgrounds/' + f + '" style="width:200px;height:150px;object-fit:cover;border:1px solid #555;"></td><td>' + label + '</td></tr>')

# Character expressions
chars = [
    ('maya', ['neytral maya.png', 'worried maya.png', 'angry maya.png', 'fetermined maya.png']),
    ('chloe', ['neutral chloe.png', 'coldchloe.png', 'smilingchloe.png', 'afraidchloe.png']),
    ('hana', ['netyural hana.png', 'inbtense hjana.png', 'sad hana.png', 'relieve dhana.png']),
    ('alex', ['curjous alex.png', 'scarealex.png', 'determinedalex.png']),
]
for char, exprs in chars:
    rows.append('<tr><th colspan="3" style="text-align:left;color:#c9a84c;">' + char.upper() + ' EXPRESSIONS</th></tr>')
    for e in exprs:
        rows.append('<tr><td>' + e + '</td><td><img src="assets/images/characters/' + char + '/' + e + '" style="width:150px;height:150px;object-fit:cover;border:1px solid #555;"></td><td>' + e.replace('.png','') + '</td></tr>')

# CG stills
cgs = [
    ('alex/move-the-character-to-a-library-scene--surrounded-.png', 'Library CG'),
    ('maya/move-the-character-to-a-security-control-room--sea.png', 'Security CG'),
    ('hana/painintg.jpeg', 'Hana painting'),
    ('masked_figure.jpeg', 'Masked figure'),
    ('conmfrontiation.jpeg', 'Confrontation'),
]
rows.append('<tr><th colspan="3" style="text-align:left;color:#c9a84c;">CG STILLS</th></tr>')
for path, label in cgs:
    rows.append('<tr><td>' + path.split('/')[-1] + '</td><td><img src="assets/images/characters/' + path + '" style="width:200px;height:150px;object-fit:cover;border:1px solid #555;"></td><td>' + label + '</td></tr>')

html = '<!DOCTYPE html><html><head><title>Test</title></head><body style="margin:0;background:#111;color:#fff;font-family:sans-serif;">'
html += '<h1 style="color:#c9a84c;">Asset Test</h1>'
html += '<table style="color:#fff;font-size:14px;">' + ''.join(rows) + '</table>'
html += '</body></html>'

open('test.html', 'w').write(html)
print('test.html written with', len(rows), 'rows')