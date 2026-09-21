content = open('src/main.js').read()
old = 'alert(text + "\\n\\nThanks for playing After Class!\\n\\nTrust points: " + trustPoints);'
new = '''    let label = "THE END";
    if (endingKey === "ending_truth") label = "TRUTH ENDING";
    else if (endingKey.startsWith("bad_")) label = "BAD ENDING";
    else label = "GOOD ENDING";
    alert(label + "\\n\\n" + text + "\\n\\nTrust points: " + trustPoints + "\\n\\nThanks for playing After Class!");'''
content = content.replace(old, new)
open('src/main.js','w').write(content)
print('Added good/bad ending labels')