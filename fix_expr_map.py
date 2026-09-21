content = open('src/systems/UIManager.js').read()

old = '''    const expressionMap = {
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
    };'''

new = '''    const expressionMap = {
      chloe: {
        neutral: "assets/images/characters/chloe/neutral chloe.png",
        cold: "assets/images/characters/chloe/coldchloe.png",
        smiling: "assets/images/characters/chloe/smilingchloe.png",
        afraid: "assets/images/characters/chloe/afraidchloe.png",
        determined: "assets/images/characters/chloe/neutral chloe.png",
        worried: "assets/images/characters/chloe/neutral chloe.png",
        default: "assets/images/characters/chloe/neutral chloe.png"
      },
      maya: {
        neutral: "assets/images/characters/maya/neytral maya.png",
        worried: "assets/images/characters/maya/worried maya.png",
        angry: "assets/images/characters/maya/angry maya.png",
        determined: "assets/images/characters/maya/fetermined maya.png",
        smirk: "assets/images/characters/maya/neytral maya.png",
        focused: "assets/images/characters/maya/neytral maya.png",
        cold: "assets/images/characters/maya/neytral maya.png",
        default: "assets/images/characters/maya/neytral maya.png"
      },
      hana: {
        neutral: "assets/images/characters/hana/netyural hana.png",
        intense: "assets/images/characters/hana/inbtense hjana.png",
        sad: "assets/images/characters/hana/sad hana.png",
        relieved: "assets/images/characters/hana/relieve dhana.png",
        worried: "assets/images/characters/hana/netyural hana.png",
        panicked: "assets/images/characters/hana/netyural hana.png",
        determined: "assets/images/characters/hana/netyural hana.png",
        default: "assets/images/characters/hana/netyural hana.png"
      },
      alex: {
        neutral: "assets/images/characters/alex/anime-xl_cinematic_keyframe_1.3_anime_keyframe_1.2_pixelated_anime_university_game_start_-1(1).jpg",
        curious: "assets/images/characters/alex/curjous alex.png",
        scared: "assets/images/characters/alex/scarealex.png",
        determined: "assets/images/characters/alex/determinedalex.png",
        default: "assets/images/characters/alex/anime-xl_cinematic_keyframe_1.3_anime_keyframe_1.2_pixelated_anime_university_game_start_-1(1).jpg"
      }
    };'''

content = content.replace(old, new)
open('src/systems/UIManager.js','w').write(content)
print('Fixed expression map - all PNGs used as defaults')