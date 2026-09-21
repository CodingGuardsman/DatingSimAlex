import json
d = json.load(open('src/data/dialogues.json'))
for nid, node in d['day5_confrontation']['nodes'].items():
    is_end = node.get('isEnd', False)
    choices = len(node.get('choices', []))
    spk = node.get('speaker', 'none')
    print(nid + ': isEnd=' + str(is_end) + ', choices=' + str(choices) + ', speaker=' + str(spk))
print()
print('Confrontation start:', d['day5_confrontation']['start'])