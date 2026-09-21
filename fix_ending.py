content = open('src/main.js').read()

old_start = content.find('  _showEnding(data) {')
old_end = content.find('  _buildSlotList()')

new_method = '''  _showEnding(data) {
    let chosenEnding = "ending_truth";
    if (this.stateManager.getFlag("flag_ending_maya")) chosenEnding = "ending_maya";
    else if (this.stateManager.getFlag("flag_ending_chloe")) chosenEnding = "ending_chloe";
    else if (this.stateManager.getFlag("flag_ending_hana")) chosenEnding = "ending_hana";

    let trustPoints = 0;
    if (chosenEnding === "ending_maya") trustPoints = this.stateManager.getFlag("flag_maya_trust") || 0;
    else if (chosenEnding === "ending_chloe") trustPoints = this.stateManager.getFlag("flag_chloe_trust") || 0;
    else if (chosenEnding === "ending_hana") trustPoints = this.stateManager.getFlag("flag_hana_trust") || 0;

    const TRUST_THRESHOLD = 3;
    let endingKey = chosenEnding;
    if (chosenEnding !== "ending_truth" && trustPoints < TRUST_THRESHOLD) {
      endingKey = "bad_" + chosenEnding;
    }

    const endings = {
      ending_maya: "ENDING: THE WATCHER - Maya exposes the footage. Chloes father is named as an accomplice. Dr. Vance is suspended. Maya loses her position. But Richardsons final night is no longer a secret. Someones finally watched the watchers.",
      ending_chloe: "ENDING: THE WINNER - Chloe uses her fathers connections to bury the scandal. She wins the election. The university maintains the original explanation. Dr. Vance continues his career. Richardsons killer remains free. Some truths are buried because people are afraid of what happens when they are found.",
      ending_hana: "ENDING: THE SILENT WITNESS - Hana reveals everything through her art exhibition. The paintings spread far beyond the university. The investigation begins. But Hana disappears from campus before anyone can find her. She finally spoke. Then she disappeared before they could silence her again.",
      ending_truth: "ENDING: AFTER CLASS - Alex publishes everything. The university descends into chaos. Maya loses her job. Chloe loses her campaign and her fathers protection. Hana becomes the center of the investigation. Alex becomes one of the people who exposed everything. No one escapes unchanged. And Richardsons final secret is no longer buried. But the truth had never promised to make anyone happy. It only promised to be the truth.",
      bad_ending_maya: "BAD ENDING: THE TRAITOR - You chose to release the footage but Maya doesnt trust you enough. She refuses to cooperate. The footage never surfaces. Richardsons death is ruled a suicide. Maya keeps her job. The truth dies with her.",
      bad_ending_chloe: "BAD ENDING: THE FOOL - You chose to bury the scandal but Chloe doesnt trust you enough. She cuts you out. Her father handles everything quietly. You know the truth but no one believes you. The election proceeds. Richardsons name is forgotten.",
      bad_ending_hana: "BAD ENDING: THE SILENCE - You chose the art exhibition but Hana doesnt trust you enough. She locks the paintings away. The gallery closes. Her work is destroyed. She disappears. You are left with nothing but questions."
    };
    const text = endings[endingKey] || "The End";
    alert(text + "\\n\\nThanks for playing After Class!\\n\\nTrust points: " + trustPoints);
    this._enterMainMenu();
  }

'''
content = content[:old_start] + new_method + content[old_end:]
open('src/main.js','w').write(content)
print('Updated _showEnding with trust point checks and bad endings')