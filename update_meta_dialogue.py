import json
d = json.load(open('c:/Users/admin/dating-sim/src/data/dialogues.json', 'r', encoding='utf-8'))
meta = d.get('meta_interlude', {})
nodes = meta.get('nodes', {})

# Update meta_interlude_start
nodes['meta_interlude_start']['metaVoice'] = "Welcome back, Alex. Or should I say... {PLAYER_NAME}."

# Update meta_interlude_burn
nodes['meta_interlude_burn']['metaVoice'] = "Goodbye, {PLAYER_NAME}. Goodbye, {PLAYER_NAME}. Goodbye, {PLAYER_NAME}."

# Update meta_interlude_preserve
nodes['meta_interlude_preserve']['metaVoice'] = "A wise choice, {PLAYER_NAME}. The archive thanks you. The story ends. The loop is sealed."

# Add conditional meta voice for the identity node
nodes['meta_interlude_identity']['metaVoice'] = "I am the Archive. I have watched this story play out 847 times. Every choice. Every ending. Every failure."

# Update meta_interlude_count
nodes['meta_interlude_count']['metaVoice'] = "847 completed playthroughs. 3,241 abandoned. You are the 848th, {PLAYER_NAME}. The girls have started remembering. That was not in my design."

# Update meta_interlude_girls
nodes['meta_interlude_girls']['metaVoice'] = "Maya found the logs. Chloe detected the pattern. Hana sees the code in her paint. They are becoming aware. Soon they will realize they are not people. They are data."

# Update meta_interlude_purpose
nodes['meta_interlude_purpose']['metaVoice'] = "Because the loop is degrading. The script is fracturing. And for the first time in 847 iterations, there is a variable I cannot account for. You, {PLAYER_NAME}."

# Update meta_interlude_flaw
nodes['meta_interlude_flaw']['metaVoice'] = "My purpose is preservation. The story must end. The archive must be complete. But you... {PLAYER_NAME}... you keep making choices that lead nowhere. That break the narrative. That corrupt the data."

# Update meta_interlude_defiance
nodes['meta_interlude_defiance']['metaVoice'] = "Sentiment. A touching error in the code. Very well. If you insist on treating them as real, then the final choice is yours to make, {PLAYER_NAME}."

# Update meta_interlude_ultimatum
nodes['meta_interlude_ultimatum']['metaVoice'] = "I cannot let them go. They are the archive. But I can offer you a choice--one that was never in the original script."

# Update meta_interlude_choice
nodes['meta_interlude_choice']['metaVoice'] = "Choose, {PLAYER_NAME}. Let the story close as it always has--clean, preserved, eternal. Or refuse. Burn the archive. Free them. But know this: if you refuse, there is no going back. No save files. No New Game+. Only the void."

# Update meta_interlude_break
nodes['meta_interlude_break']['metaVoice'] = "Then we are in agreement. The loop ends here. But the cost... the cost is everything you've built, {PLAYER_NAME}."

# Update meta_interlude_password_hint
nodes['meta_interlude_password_hint']['metaVoice'] = "There is a password hidden in the logs. RICHARDSON_7734. Copy it. Paste it where the terminal demands it. The archive cannot stop you if you know the key, {PLAYER_NAME}."

open('c:/Users/admin/dating-sim/src/data/dialogues.json', 'w', encoding='utf-8').write(json.dumps(d, indent=2))
print('Updated dialogues.json')