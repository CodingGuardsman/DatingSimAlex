import json

flags = {
  "flags": [
    {"name": "met_maya", "description": "Player met Maya", "default": False},
    {"name": "met_chloe", "description": "Player met Chloe", "default": False},
    {"name": "met_hana", "description": "Player met Hana", "default": False},
    {"name": "found_note", "description": "Player found the mysterious note", "default": False},
    {"name": "visited_library", "description": "Player visited the library", "default": False},
    {"name": "visited_maya_lab", "description": "Player visited Maya's lab", "default": False},
    {"name": "visited_chloe_office", "description": "Player visited Chloe's office", "default": False},
    {"name": "visited_hana_studio", "description": "Player visited Hana's studio", "default": False},
    {"name": "learned_richardson_truth", "description": "Player learned Richardson's secret", "default": False},
    {"name": "learned_chloe_secret", "description": "Player learned Chloe's secret", "default": False},
    {"name": "learned_hana_secret", "description": "Player learned Hana's secret", "default": False},
    {"name": "learned_maya_secret", "description": "Player learned Maya's secret", "default": False},
    {"name": "trusted_chloe", "description": "Player chose to trust Chloe", "default": False},
    {"name": "trusted_hana", "description": "Player chose to trust Hana", "default": False},
    {"name": "trusted_maya", "description": "Player chose to trust Maya", "default": False},
    {"name": "exposed_truth", "description": "Player exposed the truth publicly", "default": False},
    {"name": "chloe_relationship", "description": "Chloe relationship level", "default": 0},
    {"name": "maya_relationship", "description": "Maya relationship level", "default": 0},
    {"name": "hana_relationship", "description": "Hana relationship level", "default": 0},
    {"name": "day", "description": "Current day number", "default": 1},
    {"name": "richardson_dead", "description": "Richardson is confirmed dead", "default": True},
    {"name": "election_week", "description": "Student council election week", "default": True}
  ]
}
with open('src/data/flags.json', 'w') as f:
    json.dump(flags, f, indent=2)
print('flags.json written')
