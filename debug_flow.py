content = open('src/main.js').read()
idx = content.find('case "intro":')
if idx >= 0:
    print('FOUND intro case:', content[idx:idx+120])
else:
    print('intro case NOT FOUND')
idx2 = content.find('case "prologue":')
if idx2 >= 0:
    print('FOUND prologue case:', content[idx2:idx2+120])
else:
    print('prologue case NOT FOUND')
import json
d = json.load(open('src/data/dialogues.json'))
print('intro start:', d['intro']['start'])
print('intro nodes:', list(d['intro']['nodes'].keys()))
print('prologue start:', d['prologue']['start'])
print('prologue nodes:', list(d['prologue']['nodes'].keys()))