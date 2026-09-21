# Asset guide for cozy anime-style game art

The game is already set up to look for art in these folders:

- Backgrounds: assets/images/backgrounds/
- Character sprites: assets/images/characters/<character-id>/<expression>.png

The project includes a CC0 pixel-art pack from itch.io in
`assets/images/itch-forest/`. The campus scene currently uses
`assets/images/backgrounds/campus-pixel.png`; the original `campus.png` is
still kept as a backup.

Dialogue sprites use the cozy pixel pack in `assets/images/itch-cozy/cozy/`:

- Alex and Riley: `farmer_1.png`
- Maya and Emma: `librarian_1.png`
- Chloe: `cook_1.png`
- Hana: `gardener_1.png`

The dialogue layer uses the existing character art first. The itch.io sprites
remain available as fallback assets while a single properly matched Western
pixel-art character pack is selected.

The choice controls use `assets/images/itch-forest/sprites-1x/ui/tree-icon-ui.png`
from the Forest Pack's CC0 UI assets.

## How to replace the placeholders

1. Put your background images in the backgrounds folder.
   - Example files:
     - campus.png
     - bedroom.png

2. Put your character art in the matching character folders.
   - Example folders:
     - assets/images/characters/alex/
     - assets/images/characters/maya/
     - assets/images/characters/chloe/
     - assets/images/characters/hana/
     - assets/images/characters/riley/
     - assets/images/characters/emma/

3. Use the same expression names the game is expecting.
   - neutral
   - blush
   - determined
   - tired
   - smirk
   - happy
   - annoyed
   - excited
   - laughing
   - serious
   - warm_smile
   - concerned
   - smile
   - shy
   - concentrating
   - deep_in_thought
   - proud
   - encouraging

4. Keep the file names matching exactly, including lowercase letters and the .png extension.

Example:

- assets/images/backgrounds/campus.png
- assets/images/characters/alex/neutral.png
- assets/images/characters/chloe/excited.png

## Recommended art style

For a cozy Stardew-like feel, use:

- warm pastel colors
- soft shadows
- clean silhouettes
- simple, readable character faces
- low-contrast backgrounds with lots of atmosphere
- gentle bloom or haze for windows, cafes, parks, and dorm rooms

## Good sources

- itch.io
- OpenGameArt.org
- CraftPix
- DeviantArt
- Kenney
- Limezu

## Important

If you want to use a different background or sprite, keep the same file name and folder structure. The game will automatically use it without changing any code.

If you want, I can help you pick the exact art folders and file names for your chosen style and make sure they fit this game cleanly.
