import urllib.request
resp = urllib.request.urlopen('http://localhost:8080/src/systems/UIManager.js')
content = resp.read().decode()

checks = [
    ('charId + "_" + expression', 'cache key includes expression'),
    ('renderCGImage', 'renderCGImage exists'),
    ('data.background', 'background from data'),
    ('data.cg', 'cg from data'),
    ('expressionMap', 'expression map exists'),
]
for needle, label in checks:
    if needle in content:
        print('FIXED: ' + label)
    else:
        print('MISSING: ' + label)