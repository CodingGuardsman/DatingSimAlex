import json
with open('src/data/dialogues.json') as f:
    d = json.load(f)
d['day1_hana'] = {'start':'hana_meet','nodes':{
  'hana_meet':{'speaker':'hana','text':'You find Hana in a dim art studio. She is painting deep reds and blacks. Her eyes are sharp.','expression':'neutral','choices':[
    {'text':'Richardson death must have been difficult.','effects':{'flag_met_hana':True},'next':'hana_greeting'},
    {'text':'Your paintings look intense lately.','effects':{'flag_met_hana':True},'next':'hana_art'}
  ]},
  'hana_greeting':{'speaker':'hana','text':'Difficult does not cover it. He was the only one who believed in my work. And then he was gone.','expression':'quiet_cry','choices':[
    {'text':'He was important to you.','effects':{},'next':'hana_end'},
    {'text':'What was he working on?','effects':{},'next':'hana_research'}
  ]},
  'hana_art':{'speaker':'hana','text':'Art is the only language that can say what words can not. These paintings show what I saw.','expression':'painting','choices':[
    {'text':'Show me.','effects':{},'next':'hana_end'},
    {'text':'What do you see?','effects':{},'next':'hana_end'}
  ]},
  'hana_research':{'speaker':'hana','text':'He was researching something. Digital evidence the university wanted buried. Richardson was going to expose it. That is why he died.','expression':'stoic','choices':[
    {'text':'I want to help finish what he started.','effects':{'flag_trusted_hana':True},'next':'hana_end'},
    {'text':'What kind of evidence?','effects':{},'next':'hana_end'}
  ]},
  'hana_end':{'speaker':'hana','text':'The truth has a price. Are you willing to pay yours?','expression':'stoic','isEnd':True}
}}
with open('src/data/dialogues.json','w') as f:
    json.dump(d,f,indent=2)
print('day1_hana added. Keys:', list(d.keys()))