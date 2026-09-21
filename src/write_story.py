import json

d = {}

# ===== PROLOGUE =====
d['prologue'] = {'start':'start','nodes':{
  'start':{'speaker':None,'text':'You found a note tucked inside a library book. The handwriting was rushed, urgent: Richardson knew. Monday night. The archive. If you care about the truth, come alone. Your hands are shaking.','expression':'worried','choices':[
    {'text':'Keep the note and investigate further.','effects':{'flag_found_note':True},'next':'note_examine'},
    {'text':'Someone left this. They know what happened.','effects':{},'next':'note_examine'}
  ]},
  'note_examine':{'speaker':None,'text':'No name, no initials. But the paper is thick cream-colored with a faint watermark. Richardson was the universitys most respected professor. He was found dead in his office three days ago. The official report says suicide.','expression':'determined','choices':[
    {'text':'Go to the library again tomorrow.','effects':{},'next':'day1_end'},
    {'text':'Talk to someone on campus.','effects':{},'next':'day1_end'}
  ]},
  'day1_end':{'speaker':None,'text':'You slip the note into your pocket. Tomorrow you will investigate. The world tilted off its axis.','expression':'neutral','isEnd':True}
}}

d['chapter1_archive'] = {'start':'archive_start','nodes':{
  'archive_start':{'speaker':None,'text':'The university archive is dark and quiet. You push the door open. Rows of old records fill the room. The door behind you slowly swings shut. Your footsteps echo in the silence.','expression':'worried','choices':[
    {'text':'Search the archive for clues.','effects':{'flag_archive_searched':True},'next':'archive_log'},
    {'text':'Leave now. This was a mistake.','effects':{},'next':'archive_leave'}
  ]},
  'archive_leave':{'speaker':None,'text':'You head for the door. It wont open. You pull again. Nothing. The door suddenly swings open and you stumble backward into a figure standing in the corridor.','expression':'panicked','next':'maya_meet'},
  'archive_log':{'speaker':None,'text':'You find an old desk with an archive access log. Most entries are ordinary. Then you see RICHARDSON, R. Date: three days ago. 11:42 PM. The night he died. Another entry: AUTHORIZED ACCESS VANCE, D. A section of the page has been torn away.','expression':'determined','choices':[
    {'text':'Vance? The art professor?','effects':{},'next':'archive_scratch'},
    {'text':'Someone removed this page. Why?','effects':{},'next':'archive_scratch'}
  ]},
  'archive_scratch':{'speaker':None,'text':'You notice something scratched into a wooden shelf: R.F.F. You take a picture with your phone. Then you spot a thin metal cabinet, locked. You reach underneath and pull out a USB drive.','expression':'curious','choices':[
    {'text':'Put the USB in your pocket. This is important.','effects':{'flag_usb_found':True},'next':'maya_meet'},
    {'text':'Put it back. This is too dangerous.','effects':{},'next':'maya_meet'}
  ]},
  'maya_meet':{'speaker':'maya','text':'You are not supposed to be here.','expression':'smirk','choices':[
    {'text':'I could say the same thing about you.','effects':{'flag_met_maya':True},'next':'maya_why_here'},
    {'text':'Do I know you?','effects':{'flag_met_maya':True},'next':'maya_why_here'}
  ]},
  'maya_why_here':{'speaker':'maya','text':'Why are you here?','expression':'neutral','choices':[
    {'text':'Long story. I dont have time for it.','effects':{},'next':'maya_books'},
    {'text':'I was looking for something.','effects':{},'next':'maya_books'}
  ]},
  'maya_books':{'speaker':'maya','text':'You answered too quickly. What were you looking for?','expression':'focused','choices':[
    {'text':'Books. In an archive. Its reasonable.','effects':{},'next':'maya_id'},
    {'text':'I found something. I think its important.','effects':{},'next':'maya_id'}
  ]},
  'maya_id':{'speaker':'maya','text':'You are terrible at lying. What is your name?','expression':'smirk','choices':[
    {'text':'Alex.','effects':{},'next':'maya_knows'},
    {'text':'Why do you need to know?','effects':{},'next':'maya_knows'}
  ]},
  'maya_knows':{'speaker':'maya','text':'I know who you are. You found something. I can tell because you keep touching your right pocket.','expression':'focused','choices':[
    {'text':'You are observant.','effects':{},'next':'maya_work'},
    {'text':'What do you know about Richardson?','effects':{},'next':'maya_work'}
  ]},
  'maya_work':{'speaker':'maya','text':'I maintain some of the surveillance infrastructure. I make sure the cameras are actually recording. Until someone dies.','expression':'neutral','choices':[
    {'text':'Did you see something that night?','effects':{},'next':'maya_footage_info'},
    {'text':'Can I trust you?','effects':{},'next':'maya_footage_info'}
  ]},
  'maya_footage_info':{'speaker':'maya','text':'I saw Richardson enter the archive at around 11:42 PM. Seven minutes later, someone else entered. They were wearing a mask. Richardson did not run. It looked like he knew them.','expression':'focused','choices':[
    {'text':'Who was it?','effects':{},'next':'maya_camera'},
    {'text':'Was it Vance?','effects':{},'next':'maya_camera'}
  ]},
  'maya_camera':{'speaker':'maya','text':'The camera stopped recording for exactly six minutes. Someone manually disabled the feed. I have the original footage. But I have not given it to the university.','expression':'worried','choices':[
    {'text':'Why not?','effects':{},'next':'maya_trust'},
    {'text':'Can I see it?','effects':{},'next':'maya_trust'}
  ]},
  'maya_trust':{'speaker':'maya','text':'Because I do not know who I can trust. Do you trust the university?','expression':'cold','choices':[
    {'text':'I do not know.','effects':{},'next':'maya_end'},
    {'text':'I need to see the footage.','effects':{'flag_maya_footage_seen':True},'next':'maya_end'}
  ]},
  'maya_end':{'speaker':'maya','text':'That is the question, isnt it? Go home, Alex. If Richardson did not kill himself, who did?','expression':'determined','isEnd':True}
}}

d['chapter2_maya'] = {'start':'maya_meet2','nodes':{
  'maya_meet2':{'speaker':'maya','text':'You actually came.','expression':'smirk','choices':[
    {'text':'You told me to.','effects':{'flag_met_maya':True},'next':'maya_close_door'},
    {'text':'I could say the same thing about you.','effects':{'flag_met_maya':True},'next':'maya_close_door'}
  ]},
  'maya_close_door':{'speaker':'maya','text':'Close the door. Lock it.','expression':'neutral','choices':[
    {'text':'Seriously?','effects':{},'next':'maya_lock'},
    {'text':'Okay.','effects':{},'next':'maya_lock'}
  ]},
  'maya_lock':{'speaker':None,'text':'The door clicks shut. Maya finally turns toward you. She looks at the USB drive in your hand.','expression':'worried','next':'maya_usb'},
  'maya_usb':{'speaker':'maya','text':'Give me the USB.','expression':'focused','choices':[
    {'text':'How did you know I had it?','effects':{},'next':'maya_usb_found'},
    {'text':'Here. Take it.','effects':{'flag_usb_given':True},'next':'maya_usb_found'}
  ]},
  'maya_usb_found':{'speaker':'maya','text':'The USB wasnt there yesterday. I checked. After Richardson died, I searched the archive because I knew the official story was wrong.','expression':'determined','choices':[
    {'text':'What is on it?','effects':{},'next':'maya_usb_password'},
    {'text':'You knew it was murder?','effects':{},'next':'maya_usb_password'}
  ]},
  'maya_usb_password':{'speaker':'maya','text':'I dont know. I havent opened it. I dont have the password. If someone put that drive there, they probably dont want us opening it.','expression':'neutral','choices':[
    {'text':'Then why should we?','effects':{},'next':'maya_footage_play'},
    {'text':'Let me try to open it.','effects':{},'next':'maya_footage_play'}
  ]},
  'maya_footage_play':{'speaker':'maya','text':'Sit. I have the original footage. The universitys version was edited. Six minutes are missing. Watch the reflection, not Richardson.','expression':'focused','choices':[
    {'text':'Why the reflection?','effects':{},'next':'maya_reflection'},
    {'text':'Show me.','effects':{},'next':'maya_reflection'}
  ]},
  'maya_reflection':{'speaker':None,'text':'The timestamp reads 11:38 PM. Richardson enters. In the glass door beside the archive, another shape appears in the reflection. Someone is across the corridor. Richardson sees them. He goes inside anyway.','expression':'determined','next':'maya_zoom'},
  'maya_zoom':{'speaker':'maya','text':'Zoom in on the access card. There is a symbol on it. The database entry for that card was deleted. Completely. Someone with administrator privileges did it.','expression':'focused','choices':[
    {'text':'Can you recover it?','effects':{},'next':'maya_server_room'},
    {'text':'Who has administrator access?','effects':{},'next':'maya_server_room'}
  ]},
  'maya_server_room':{'speaker':'maya','text':'Not from here. The old server room under the administration building has backups. But its restricted. And whoever deleted that entry might notice if I start digging.','expression':'worried','choices':[
    {'text':'Then we go together.','effects':{'flag_maya_plan':True},'next':'maya_richardson'},
    {'text':'Be careful. Someone might be watching.','effects':{'flag_maya_caution':True},'next':'maya_richardson'}
  ]},
  'maya_richardson':{'speaker':'maya','text':'Richardson helped me get this job. He said I was good at finding things other people missed. You knew him? No. Then dont pretend you understand him.','expression':'neutral','choices':[
    {'text':'Why are you helping me?','effects':{},'next':'maya_tired'},
    {'text':'What else do you know?','effects':{},'next':'maya_tired'}
  ]},
  'maya_tired':{'speaker':'maya','text':'Because Im tired. Tired of watching things happen and pretending I didnt see them. The night Richardson died wasnt the first time someone accessed the archive after hours. Three other incidents. All on Mondays.','expression':'determined','choices':[
    {'text':'What happened to the other footage?','effects':{},'next':'maya_monday'},
    {'text':'Then someone is using the archive every Monday.','effects':{},'next':'maya_monday'}
  ]},
  'maya_monday':{'speaker':'maya','text':'The first two recordings are deleted. The third is corrupted. Only the fourth, Richardson, is intact. A folder called MONDAY_ARCHIVE appeared beside the video. I didnt create it. Whoever accessed my computer while you were sitting here knows you are now.','expression':'panicked','choices':[
    {'text':'What do we do?','effects':{},'next':'maya_warning'},
    {'text':'Leave now.','effects':{},'next':'maya_warning'}
  ]},
  'maya_warning':{'speaker':'maya','text':'Meet me here tomorrow after the election debate. Everyone will be watching the candidates. Well find out who used the archive before Richardson. And if they were involved, well find out why.','expression':'determined','choices':[
    {'text':'Its a plan.','effects':{'flag_maya_plan':True},'next':'maya_threat'},
    {'text':'Its a gamble. What if they were involved?','effects':{},'next':'maya_threat'}
  ]},
  'maya_threat':{'speaker':None,'text':"Alex steps outside. The campus is silent. His phone vibrates. Three messages appear from an unknown number: STOP LOOKING INTO RICHARDSON. MAYA CANT PROTECT YOU. SHE COULDNT PROTECT HIM EITHER.",'expression':'panicked','isEnd':True}
}}

d['chapter3_chloe'] = {'start':'chloe_meet','nodes':{
  'chloe_meet':{'speaker':'chloe','text':'Talking to my poster? Thats either flattering or deeply concerning.','expression':'smirk','choices':[
    {'text':'I was just looking.','effects':{'flag_met_chloe':True},'next':'chloe_knows'},
    {'text':'Youre everywhere. Its hard to miss.','effects':{'flag_met_chloe':True},'next':'chloe_knows'}
  ]},
  'chloe_knows':{'speaker':'chloe','text':'Youre the student who was asking questions about his research last semester. I remember people who ask unusual questions.','expression':'neutral','choices':[
    {'text':'You remember that?','effects':{},'next':'chloe_campaign'},
    {'text':'Why would you care?','effects':{},'next':'chloe_campaign'}
  ]},
  'chloe_campaign':{'speaker':'chloe','text':'I remember potentially useful ones. Come to the debate. Curious people always show up.','expression':'smirk','choices':[
    {'text':'I will.','effects':{'flag_chloe_debate':True},'next':'chloe_office'},
    {'text':'Maybe.','effects':{},'next':'chloe_office'}
  ]},
  'chloe_office':{'speaker':'chloe','text':'You came. I am. I invite hundreds of people. Youre suspicious. Much better.','expression':'smirk','choices':[
    {'text':'I wanted to ask you something.','effects':{},'next':'chloe_richardson'},
    {'text':'About the election?','effects':{},'next':'chloe_richardson'}
  ]},
  'chloe_richardson':{'speaker':'chloe','text':'Richardson. Thats an unusual subject. Not anymore. Why are you asking me? You knew him? Everyone knew Richardson. You knew him better than most. According to whom?','expression':'neutral','choices':[
    {'text':'People have been talking.','effects':{},'next':'chloe_night'},
    {'text':'Did you speak to him Monday night?','effects':{},'next':'chloe_night'}
  ]},
  'chloe_night':{'speaker':'chloe','text':'Not here. Half the people in this room are volunteers. And half of them have phones. Youre worried someone will hear? Im worried someone will misunderstand.','expression':'worried','choices':[
    {'text':'Then tell me.','effects':{},'next':'chloe_funding'},
    {'text':'Why not here?','effects':{},'next':'chloe_funding'}
  ]},
  'chloe_funding':{'speaker':'chloe','text':'I did talk to Richardson Monday night. About university funding. Research funding. He was angry. About money. Its supposed to be vague. Was your father involved?','expression':'determined','choices':[
    {'text':'Hes funded the science building.','effects':{},'next':'chloe_dangerous'},
    {'text':'What did Richardson say?','effects':{},'next':'chloe_dangerous'}
  ]},
  'chloe_dangerous':{'speaker':'chloe','text':'Youre asking dangerous questions. A donation is voluntary. Funding can come with expectations. Did his donation come with expectations? You dont know what youre getting yourself into. Neither did Richardson.','expression':'cold','choices':[
    {'text':'Tell me the truth.','effects':{'flag_chloe_pushed':True},'next':'chloe_father'},
    {'text':'Back off.','effects':{},'next':'chloe_father'}
  ]},
  'chloe_father':{'speaker':'chloe','text':'My father isnt the person you think he is. Then tell me. I cant. Why? Because when my father handles things, they disappear. Problems, not people. You dont know my family.','expression':'cold','choices':[
    {'text':'What did Richardson have on him?','effects':{},'next':'chloe_threat'},
    {'text':'What does your father know?','effects':{},'next':'chloe_threat'}
  ]},
  'chloe_threat':{'speaker':'chloe','text':'They knew his name. They knew where I was. Me to stop asking questions. About Richardson? About my father. Because apparently someone thinks Im going to expose something. Are you? I dont know anymore.','expression':'panicked','choices':[
    {'text':'What did they say?','effects':{},'next':'chloe_richardson_quote'},
    {'text':'Why did you tell me this?','effects':{},'next':'chloe_richardson_quote'}
  ]},
  'chloe_richardson_quote':{'speaker':'chloe','text':'He told me not to trust my father. He laughed like he couldnt believe I had to ask. Your father isnt the one you should be afraid of. It was the first time Id ever seen him scared.','expression':'determined','choices':[
    {'text':'Why didnt you report this?','effects':{},'next':'chloe_perception'},
    {'text':'Who should you be afraid of?','effects':{},'next':'chloe_perception'}
  ]},
  'chloe_perception':{'speaker':'chloe','text':'Nobody would believe me. If I accused my fathers business associates of threatening a professor, everyone would think I was using his death to attack my fathers reputation. Perception matters. To your campaign. To everything. Id rather stay quiet? I didnt say that. Theres a difference between being quiet and being stupid.','expression':'cold','choices':[
    {'text':'Are you going to do something?','effects':{},'next':'chloe_tomorrow'},
    {'text':'Why trust me?','effects':{},'next':'chloe_tomorrow'}
  ]},
  'chloe_tomorrow':{'speaker':'chloe','text':'Find out. With you, if you are willing. Why trust me? I dont. Because you are already involved. Tomorrow. The foundation office. Six. If anyone asks why you are there, you are helping with my campaign. Because if they know you are investigating Richardson, they might stop you. The people who want this buried. They arent afraid of getting caught. Because Richardson was. And hes dead.','expression':'determined','choices':[
    {'text':'I will be there.','effects':{'flag_chloe_tomorrow':True},'next':'chloe_threat2'},
    {'text':'This is too dangerous.','effects':{},'next':'chloe_threat2'}
  ]},
  'chloe_threat2':{'speaker':None,'text':"Alex steps outside. The campaign lights are still on. One poster has been cut perfectly down the middle. Behind it, written on the wall: YOUR FATHER CANT PROTECT YOU FOREVER. His phone vibrates. Unknown number: ASK CHLOE WHAT HAPPENED IN THE ARCHIVE. The lights in Chloes room suddenly go dark.",'expression':'panicked','isEnd':True}}}
d['chapter4_hana'] = {'start':'hana_meet','nodes':{
  'hana_meet':{'speaker':'hana','text':'You should not stand so close. The paint is still wet.','expression':'neutral','choices':[
    {'text':'Sorry. I didnt notice.','effects':{'flag_met_hana':True},'next':'hana_richardson_mention'},
    {'text':'It doesnt look wet.','effects':{'flag_met_hana':True},'next':'hana_richardson_mention'}
  ]},
  'hana_richardson_mention':{'speaker':'hana','text':'Richardson mentioned you once. He said you noticed things. Was it good? He didnt say. Was it bad? He didnt say that either.','expression':'neutral','choices':[
    {'text':'What did he say about me?','effects':{},'next':'hana_paintings'},
    {'text':'Why are you here?','effects':{},'next':'hana_paintings'}
  ]},
  'hana_paintings':{'speaker':'hana','text':'You looked at the paintings before you looked at me. People usually look at me first. They want to know if Im strange. Sometimes. Its easier than pretending.','expression':'neutral','choices':[
    {'text':'Are these from your exhibition?','effects':{},'next':'hana_exhibition'},
    {'text':'What is the exhibition called?','effects':{},'next':'hana_exhibition'}
  ]},
  'hana_exhibition':{'speaker':'hana','text':'After the Bell. Its about what happens after everyone leaves. After class? Something like that.','expression':'neutral','choices':[
    {'text':'That corridor looks familiar.','effects':{},'next':'hana_archive'},
    {'text':'Did you paint the archive?','effects':{},'next':'hana_archive'}
  ]},
  'hana_archive':{'speaker':'hana','text':'I was nearby. That is when you do not want to be found. Were you inside? No. Outside? Yes. Richardson asked me to bring him something. A folder. I dont know what was in it. He told me not to look.','expression':'worried','choices':[
    {'text':'Did you see Richardson that night?','effects':{},'next':'hana_vance'},
    {'text':'What was in the folder?','effects':{},'next':'hana_vance'}
  ]},
  'hana_vance':{'speaker':'hana','text':'Vance is your mentor. Richardson was your mentor before him. They respected each other. It wasnt. Research. Funding, among other things. Things that should have stayed buried. Did Vance know Richardson was afraid? Yes. Did he know Richardson was going to the archive? Yes. Richardson told him.','expression':'determined','choices':[
    {'text':'Did Vance go with him?','effects':{},'next':'hana_threat'},
    {'text':'Were you at the archive?','effects':{},'next':'hana_threat'}
  ]},
  'hana_threat':{'speaker':'hana','text':'I cant tell you. I promised. To whom? Dr. Vance. You were there? I was nearby. Outside. Before eleven. I cant. Because if I tell you, you will go there. The archive is not safe. Richardson went there and he did not come back.','expression':'panicked','choices':[
    {'text':'What did you see?','effects':{},'next':'hana_masked'},
    {'text':'Why are you hiding this?','effects':{},'next':'hana_masked'}
  ]},
  'hana_masked':{'speaker':'hana','text':'Someone came out. From the archive? Yes. The masked person? Yes. They saw me. I think so. I hid behind the service stairwell. They were carrying something. A folder. The old service passage leads to the old research building. Someone was waiting in the passage. It is done. What about the girl? Me.','expression':'panicked','choices':[
    {'text':'Who was waiting?','effects':{},'next':'hana_photo'},
    {'text':'They knew you were there?','effects':{},'next':'hana_photo'}
  ]},
  'hana_photo':{'speaker':'hana','text':'They showed me a photograph. Richardson, alive, inside the archive. Someone standing behind him. Not Vance. Someone I know. The person behind him has a signet ring. Chloe is crying when she says her father would destroy everything connected to me. My paintings, my records, my future.','expression':'determined','choices':[
    {'text':'Who is behind Richardson?','effects':{},'next':'hana_vance_reveal'},
    {'text':'Why did Chloe let you in?','effects':{},'next':'hana_vance_reveal'}
  ]},
  'hana_vance_reveal':{'speaker':'hana','text':'Chloe let me into the research building. She said Richardson had warned her that her father wasnt the person she should fear. The person behind him. The one with the ring. I think you already know. Vance. Richardson told me. Vance was involved. He knew Richardson knew. People like him dont leave when they are afraid. They make other people afraid.','expression':'determined','choices':[
    {'text':'What is in the research building?','effects':{},'next':'hana_key'},
    {'text':'Did you go there?','effects':{},'next':'hana_key'}
  ]},
  'hana_key':{'speaker':'hana','text':'Records. Research records show who receives it. Financial records show where money goes. The room was empty. A chair, a broken monitor. Documents gone. Computers gone. Someone cleaned it out. Chloe let me in. She said if I spoke, her father would destroy everything connected to me.','expression':'panicked','choices':[
    {'text':'Here. Take this key.','effects':{'flag_hana_key':True},'next':'hana_threat2'},
    {'text':'I should go.','effects':{},'next':'hana_threat2'}
  ]},
  'hana_threat2':{'speaker':None,'text':"Alex stands outside the arts building with the key in his hand. His phone vibrates. Three messages: HANA TALKS TOO MUCH. THE KEY WONT HELP YOU. ASK HER WHO OPENED THE DOOR. A shadow moves behind the gallery window. The lights turn off.",'expression':'panicked','isEnd':True}}}
d['day5_confrontation'] = {'start':'confront_start','nodes':{
  'confront_start':{'speaker':None,'text':"The old research building. Alex opens the rusted door with Hana's key. Inside: old computers, filing cabinets, boxes of research papers. At the back, a single folder. Financial transfers. Research grants. University accounts. Private foundations. Three names: DR. VANCE, CHLOES FATHER, UNIVERSITY EXECUTIVE BOARD.",'expression':'determined','choices':[
    {'text':'Read the folder carefully.','effects':{},'next':'confront_maya'},
    {'text':'Look around for more evidence.','effects':{},'next':'confront_maya'}
  ]},
  'confront_maya':{'speaker':'maya','text':"You should not be here alone. How did you find me? Hana told me. Eventually.","expression':'focused','choices':[
    {'text':'Then Chloe is here too.','effects':{},'next':'confront_chloe'},
    {'text':'What does Hana know?','effects':{},'next':'confront_chloe'}
  ]},
  'confront_chloe':{'speaker':'chloe','text':"Then I suppose there is no point pretending anymore. You knew. I knew some of it. Your father is in these records. Yes. Vance too. Yes. And Richardson found out. Yes. Then who killed him?","expression':'cold','choices':[
    {'text':'Hana knows. Ask her.','effects':{},'next':'confront_hana'},
    {'text':'Maya, do you know?','effects':{},'next':'confront_hana'}
  ]},
  'confront_hana':{'speaker':'hana','text':"I know. I saw them. The masked person wasnt the one who killed Richardson. The person who sent them. Vance. I heard them. I knew his voice. He used someone else because he did not want to be seen. The masked person was supposed to remove Richardsons evidence. They couldnt find everything. The USB. Thats why the cameras were disabled.","expression':'determined','choices':[
    {'text':'Then who was the masked person?','effects':{},'next':'confront_trust'},
    {'text':'Why did Richardson go to the archive?','effects':{},'next':'confront_trust'}
  ]},
  'confront_trust':{'speaker':'hana','text':"Because he thought he could trust someone. Chloe. You told him you would help? I tried. But you didn't. My father found out. He told me to stay out of it. You listened. For one night. One night was enough. You think I don't know that?","expression':'determined','choices':[
    {'text':'We have enough. What do we do?','effects':{},'next':'confront_choice'},
    {'text':'Chloe, what do you want?','effects':{},'next':'confront_choice'}
  ]},
  'confront_choice':{'speaker':None,'text':"We have the records. The footage. The paintings. The USB. The access logs. The photographs. We have enough. But Chloe says if we release everything, innocent people get destroyed too. We have three people. Three choices. One decision.","expression':'determined','choices':[
    {'text':'Release Mayas footage and expose Chloes father.','effects':{'flag_ending_maya':True},'next':'ending_maya'},
    {'text':'Help Chloe bury the scandal.','effects':{'flag_ending_chloe':True},'next':'ending_chloe'},
    {'text':'Let Hana reveal the truth through her exhibition.','effects':{'flag_ending_hana':True},'next':'ending_hana'},
    {'text':'Publish everything and expose everyone.','effects':{'flag_ending_truth':True},'next':'ending_truth'}
  ]},
  'ending_maya':{'speaker':None,'text':"Maya uploads the footage. The university is engulfed in scandal. Chloes father is named as an accomplice. Dr. Vance is suspended. Maya loses her position. But Richardsons final night is no longer a secret. Someones finally watched the watchers. THE END.","expression':'neutral','isEnd':True},
  'ending_chloe':{'speaker':None,'text':"Chloe uses her fathers connections to bury the scandal. She wins the election. The university maintains the original explanation. Dr. Vance continues his career. Richardsons killer remains free. Some truths are buried because people are afraid of what happens when they are found. THE END.","expression':'neutral','isEnd':True},
  'ending_hana':{'speaker':None,'text':"Hana reveals everything through her art exhibition. The paintings spread far beyond the university. The investigation begins. But Hana disappears from campus before anyone can find her. She finally spoke. Then she disappeared before they could silence her again. THE END.","expression':'neutral','isEnd':True},
  'ending_truth':{'speaker':None,'text':"Alex publishes everything. The university descends into chaos. Maya loses her job. Chloe loses her campaign and her fathers protection. Hana becomes the center of the investigation. Alex becomes one of the people who exposed everything. No one escapes unchanged. And Richardsons final secret is no longer buried. But the truth had never promised to make anyone happy. It only promised to be the truth. THE END.","expression':'neutral','isEnd':True}
with open('src/data/dialogues.json','w') as f:
    json.dump(d,f,indent=2)
print('Confrontation added. Keys:', list(d.keys()))
print('Total nodes:', sum(len(t['nodes']) for t in d.values()))
}}
