import json

with open('src/data/dialogues.json') as f:
    d = json.load(f)

d['day1_maya'] = {'start':'maya_meet','nodes':{
  'maya_meet':{'speaker':'maya','text':'You found Maya in the CS lab. She looks up from her terminal, eyes sharp. You should not be here.','expression':'smirk','choices':[
    {'text':'Richardson was not suicidal. Someone killed him.','effects':{'flag_met_maya':True,'flag_trusted_maya':True},'next':'maya_footage'},
    {'text':'Can you help me? I need the truth.','effects':{'flag_met_maya':True},'next':'maya_footage'}
  ]},
  'maya_footage':{'speaker':'maya','text':'I can see every camera on campus. Richardson was meeting someone the night he died. But the person wore a mask. I have the unedited footage.','expression':'focused','choices':[
    {'text':'I need to see that footage.','effects':{},'next':'maya_offer'},
    {'text':'Who was wearing the mask?','effects':{},'next':'maya_offer'}
  ]},
  'maya_offer':{'speaker':'maya','text':'The footage does not lie. But the person who ordered the deletion is someone with power. Justice or safety?','expression':'focused','isEnd':True}
}}

with open('src/data/dialogues.json','w') as f:
    json.dump(d,f,indent=2)
print('day1_maya added')