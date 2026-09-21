import json
with open('src/data/dialogues.json') as f:
    d = json.load(f)
d['day1_chloe'] = {'start':'chloe_meet','nodes':{
  'chloe_meet':{'speaker':'chloe','text':'You find Chloe near the student union. She is warm, magnetic, put-together. But her smile falters when she catches you.','expression':'smiling','choices':[
    {'text':'Dr. Richardson was a good man. Do you remember him?','effects':{'flag_met_chloe':True},'next':'chloe_richardson'},
    {'text':'I think you are running a great campaign.','effects':{'flag_met_chloe':True},'next':'chloe_greeting'}
  ]},
  'chloe_greeting':{'speaker':'chloe','text':'Oh! Hey! Most people just see posters. But trust is hard to earn. What made you stop?','expression':'smiling','choices':[
    {'text':'I admire people who try to make a difference.','effects':{},'next':'chloe_end'},
    {'text':'I need help with something serious.','effects':{},'next':'chloe_secret'}
  ]},
  'chloe_richardson':{'speaker':'chloe','text':'Richardson was different. He actually cared about students. I respected him more than anyone.','expression':'cold','choices':[
    {'text':'Do you know what happened to him?','effects':{},'next':'chloe_death'},
    {'text':'He sounds worth remembering.','effects':{},'next':'chloe_end'}
  ]},
  'chloe_death':{'speaker':'chloe','text':'He is dead. The report says suicide. But I know what people whisper. I know more than you might think.','expression':'cold','choices':[
    {'text':'Do you know who killed him?','effects':{'flag_trusted_chloe':True},'next':'chloe_killer'},
    {'text':'What do you know?','effects':{},'next':'chloe_killer'}
  ]},
  'chloe_killer':{'speaker':'chloe','text':'I can not tell you yet. Someone powerful did not want Richardson to speak. They will stop at nothing.','expression':'determined','isEnd':True},
  'chloe_secret':{'speaker':'chloe','text':'My father received a phone call the night Richardson died. A threatening call.','expression':'tears','isEnd':True},
  'chloe_end':{'speaker':'chloe','text':'I will help, but only if you protect me.','expression':'determined','isEnd':True}
}}
with open('src/data/dialogues.json','w') as f:
    json.dump(d,f,indent=2)
print('day1_chloe added. Keys:', list(d.keys()))