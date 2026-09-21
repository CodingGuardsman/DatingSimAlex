content = open('src/systems/UIManager.js').read()

# 1. Fix background map
old_bg = '''    const backgroundAssets = {
      bedroom: "assets/images/backgrounds/bedroom.png",
      campus: "assets/images/backgrounds/campus.png",
      university: "assets/images/backgrounds/classroom-hero.jpg",
      library: "assets/images/backgrounds/classroom-hero.jpg",
      archive: "assets/images/backgrounds/classroom-hero.jpg",
      default: "assets/images/backgrounds/classroom-hero.jpg"
    };'''
new_bg = '''    const backgroundAssets = {
      bedroom: "assets/images/backgrounds/bedroom.png",
      campus: "assets/images/backgrounds/campus.png",
      university: "assets/images/backgrounds/classroom-hero.jpg",
      library: "assets/images/backgrounds/library.jpeg",
      archive: "assets/images/backgrounds/archuive.jpeg",
      security: "assets/images/backgrounds/security contoro room.jpeg",
      campaign: "assets/images/backgrounds/campagin office.jpeg",
      gallery: "assets/images/backgrounds/gallery .jpeg",
      research: "assets/images/backgrounds/old research builkding.jpeg",
      default: "assets/images/backgrounds/classroom-hero.jpg"
    };'''
content = content.replace(old_bg, new_bg)

# 2. Fix portrait map with expression variants
old_portrait = '''    const portraitPaths = {
      chloe: "assets/images/characters/chloe/anime-xl_cinematic_keyframe_1.3_anime_keyframe_1.2_32_bit_pixelated_anime_girl_black_hair-1.jpg",
      maya: "assets/images/characters/maya/anime-xl_cinematic_keyframe_1.3_anime_keyframe_1.2_pixelated_anime_woman_sprite_smile_bro-2.jpg",
      hana: "assets/images/characters/hana/anime-xl_cinematic_keyframe_1.3_anime_keyframe_1.2_32_bit_pixelated_anime_girl_blonde_wit-3.jpg",
      alex: "assets/images/characters/alex/anime-xl_cinematic_keyframe_1.3_anime_keyframe_1.2_pixelated_anime_university_game_start_-1(1).jpg"
    };

    const portraitPath = portraitPaths[charId];'''
new_portrait = '''    const expressionMap = {
      chloe: {
        neutral: "assets/images/characters/chloe/neutral chloe.png",
        cold: "assets/images/characters/chloe/coldchloe.png",
        smiling: "assets/images/characters/chloe/smilingchloe.png",
        afraid: "assets/images/characters/chloe/afraidchloe.png",
        default: "assets/images/characters/chloe/anime-xl_cinematic_keyframe_1.3_anime_keyframe_1.2_32_bit_pixelated_anime_girl_black_hair-1.jpg"
      },
      maya: {
        neutral: "assets/images/characters/maya/neytral maya.png",
        worried: "assets/images/characters/maya/worried maya.png",
        angry: "assets/images/characters/maya/angry maya.png",
        determined: "assets/images/characters/maya/fetermined maya.png",
        default: "assets/images/characters/maya/anime-xl_cinematic_keyframe_1.3_anime_keyframe_1.2_pixelated_anime_woman_sprite_smile_bro-2.jpg"
      },
      hana: {
        neutral: "assets/images/characters/hana/netyural hana.png",
        intense: "assets/images/characters/hana/inbtense hjana.png",
        sad: "assets/images/characters/hana/sad hana.png",
        relieved: "assets/images/characters/hana/relieve dhana.png",
        default: "assets/images/characters/hana/anime-xl_cinematic_keyframe_1.3_anime_keyframe_1.2_32_bit_pixelated_anime_girl_blonde_wit-3.jpg"
      },
      alex: {
        neutral: "assets/images/characters/alex/anime-xl_cinematic_keyframe_1.3_anime_keyframe_1.2_pixelated_anime_university_game_start_-1(1).jpg",
        curious: "assets/images/characters/alex/curjous alex.png",
        scared: "assets/images/characters/alex/scarealex.png",
        determined: "assets/images/characters/alex/determinedalex.png",
        default: "assets/images/characters/alex/anime-xl_cinematic_keyframe_1.3_anime_keyframe_1.2_pixelated_anime_university_game_start_-1(1).jpg"
      }
    };

    const exprMap = expressionMap[charId] || {};
    const portraitPath = exprMap[expression] || exprMap["default"] || exprMap["neutral"];
    if (!portraitPath) return;'''
content = content.replace(old_portrait, new_portrait)

# 3. Add CG still rendering for special scenes
old_cg = '''  _hideDialogueBox()'''
new_cg = '''  renderCGImage(imagePath) {
    const layer = this.sceneLayer;
    const existing = document.getElementById("cg-still");
    if (existing) existing.remove();
    const img = document.createElement("img");
    img.id = "cg-still";
    img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:3;animation:fadeIn 0.8s ease;";
    img.src = imagePath;
    layer.appendChild(img);
  }

  _hideDialogueBox()'''
content = content.replace(old_cg, new_cg)

open('src/systems/UIManager.js','w').write(content)
print('Updated backgrounds, portraits with expressions, and CG still support')