import json
with open('src/data/dialogues.json') as f:
    d = json.load(f)
d['day2_confrontation'] = {'start':'day2_start','nodes':{
  'day2_start':{'speaker':None,'text':'You now have pieces of the puzzle. Maya has the footage. Chloe has the connections. Hana has the eyewitness account. But one of them is hiding the biggest secret of all. Tonight you face the final choice. Who do you trust?','expression':'determined','choices':[
    {'text':'I trust Maya and expose the truth with the footage.','effects':{'flag_trusted_maya':True},'next':'ending_maya'},
    {'text':'I trust Chloe and work within the system.','effects':{'flag_trusted_chloe':True},'next':'ending_chloe'},
    {'text':'I trust Hana and follow her lead.','effects':{'flag_trusted_hana':True},'next':'ending_hana'},
    {'text':'I expose everything publicly.','effects':{'flag_exposed_truth':True},'next':'ending_truth'}
  ]},
  'ending_maya':{'speaker':'maya','text':'Maya presents the footage at the student council meeting. The evidence is undeniable. Richardson was murdered and Vance was the killer. But when Vance is exposed, Chloe father is also named as an accomplice. The university erupts in scandal. Maya is hailed as a hero, but Chloe campaign is destroyed. You saved the truth but lost the person you trusted most.','expression':'determined','isEnd':True},
  'ending_chloe':{'speaker':'chloe','text':'Chloe uses her father political connections to quietly remove Vance from the university and bury the scandal. Richardson name is cleared, but the truth never comes out publicly. Chloe wins the election and becomes president. She promises to protect the university from scandal. But you know the real killer is free. And Chloe is now more powerful than ever.','expression':'tears','isEnd':True},
  'ending_hana':{'speaker':'hana','text':'Hana reveals the truth through her art. An exhibition that exposes everything. The paintings go viral. Richardson is vindicated. Vance is exposed. But Hana herself is targeted by those she exposed. She disappears from campus. You saved the truth, but the person who told it is gone.','expression':'stoic','isEnd':True},
  'ending_truth':{'speaker':None,'text':'You publish everything to the entire university online. The truth explodes across campus. Richardson is vindicated, Vance is arrested, and Chloe father corruption is exposed. But the fallout is enormous. Maya loses her job. Chloe loses everything. Hana is exposed and targeted. You chose truth over safety. The university will never be the same.','expression':'determined','isEnd':True}
}}
with open('src/data/dialogues.json','w') as f:
    json.dump(d,f,indent=2)
print('day2_confrontation added. Keys:', list(d.keys()))