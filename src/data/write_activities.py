import json

activities = {
  "activities": [
    {
      "id": "library_investigation",
      "name": "Investigate the Library",
      "description": "The note mentioned the library. Something is hidden in these shelves. Richardson's name echoes through the stacks.",
      "availableTimes": ["morning"],
      "effects": {"stat_intelligence": 8, "stat_charm": 3},
      "timeCost": "morning",
      "triggersDialogue": "library_investigation",
      "requirements": {"found_note": False}
    },
    {
      "id": "campus_walk",
      "name": "Walk Campus",
      "description": "Stroll around campus. Election posters everywhere — Chloe's smiling face stares from every wall.",
      "availableTimes": ["afternoon"],
      "effects": {"stat_charm": 5, "stat_social": 3},
      "timeCost": "afternoon",
      "triggersDialogue": "campus_walk"
    },
    {
      "id": "visit_maya_lab",
      "name": "Visit CS Lab",
      "description": "The surveillance lab is locked after hours. Maya might be inside. But what if she's watching YOU?",
      "availableTimes": ["evening"],
      "effects": {"stat_intelligence": 5, "stat_charm": 2},
      "timeCost": "evening",
      "triggersDialogue": "visit_maya_lab",
      "requirements": {"met_maya": True}
    },
    {
      "id": "visit_chloe_office",
      "name": "Visit Campaign Office",
      "description": "Chloe's campaign office smells like ambition and fear. She needs every vote she can get.",
      "availableTimes": ["afternoon", "evening"],
      "effects": {"stat_charm": 5, "stat_social": 4},
      "timeCost": "afternoon",
      "triggersDialogue": "visit_chloe_office",
      "requirements": {"met_chloe": True}
    },
    {
      "id": "visit_hana_studio",
      "name": "Visit Art Studio",
      "description": "Hana's studio is dimly lit. Paintings cover every wall — scenes that look disturbingly like the night Richardson died.",
      "availableTimes": ["afternoon", "evening"],
      "effects": {"stat_intelligence": 4, "stat_charm": 6},
      "timeCost": "afternoon",
      "triggersDialogue": "visit_hana_studio",
      "requirements": {"met_hana": True}
    },
    {
      "id": "examine_note",
      "name": "Examine the Note Again",
      "description": "You found the note. Rereading it: Richardson was supposed to meet someone Monday night. Who?",
      "availableTimes": ["morning"],
      "effects": {"stat_intelligence": 10, "stat_charm": 2},
      "timeCost": "morning",
      "triggersDialogue": "examine_note",
      "requirements": {"found_note": True}
    },
    {
      "id": "confrontation_preparation",
      "name": "Prepare for Confrontation",
      "description": "You need to decide who to trust. Each choice changes everything.",
      "availableTimes": ["evening"],
      "effects": {},
      "timeCost": "evening",
      "triggersDialogue": "confrontation_preparation",
      "requirements": {"met_maya": True, "met_chloe": True, "met_hana": True}
    }
  ]
}
with open('src/data/activities.json', 'w') as f:
    json.dump(activities, f, indent=2)
print('activities.json written')
