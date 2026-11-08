# Recorded music

The game synthesizes every track live. A track plays a recorded file instead only when `manifest.json` lists one, so any track without a file still uses the synth.

## Adding a track
1. Make it in Suno (see the prompts below). Turn on **Instrumental**. Download as WAV if your plan allows, otherwise MP3.
2. Run:
   ```
   python tools/prep_music.py day "C:\path\to\download.wav"
   ```
   This trims silence, evens out loudness, writes `assets/music/day.mp3` and adds the track to `manifest.json`.
3. Play the scene and listen to the loop. If the jump back is audible, run the script again with `--loop-start` and `--loop-end` in seconds. Pick two points on the same beat, usually the start of a phrase after the intro, and the end of a phrase just before the outro.
4. To go back to the synth: `python tools/prep_music.py --remove day`.

## Licensing
Songs made on Suno's **free plan are not licensed for commercial use**. The game is sold, so make every shipped track on a paid plan. Make it on the paid plan itself, since upgrading later does not cover songs you already made. Record each one below.

| Track | Suno song title / link | Made on plan | Date |
|---|---|---|---|
| all tracks | Made by the developer | n/a (own work) | 2026-11-08 |

## Prompts
Paste the **Style** text into Suno's style box, with Instrumental on. Each track should sound sweet, sincere and slightly too perfect. Don't make it creepy: the game makes the music wrong itself, by slowing the tape for `wrong` and muffling it behind the menu, and that only works if the original is sweet. Short, loopable pieces (1:30 to 2:30) work best.

**`day`: Act 1 afternoons, the main theme.** The `wrong` rerun theme is this same file slowing down, so it matters most.
> Style: cheerful slice-of-life anime school BGM, bright acoustic piano, glockenspiel, light strings, soft brushed drums, 86 bpm, F major, warm, nostalgic, sunny afternoon, instrumental, loopable, no vocals

**`morning`: the bakery, the 7:42 train, the courtyard.**
> Style: bouncy upbeat anime morning BGM, pizzicato strings, ukulele, hand claps, bells, light bass, 112 bpm, G major, playful, fresh, instrumental, loopable, no vocals

**`evening`: the walk home, sunsets.**
> Style: gentle sunset visual novel BGM, soft electric piano, warm pads, light acoustic guitar, 66 bpm, D minor to F major, wistful, golden hour, cicadas fading, instrumental, loopable, no vocals

**`romance`: confessions, the last night.**
> Style: tender romantic visual novel piano solo with soft string swell, 70 bpm, E flat major, intimate, heartfelt, slow, instrumental, loopable, no vocals

**`hearing`: the engagement hearing, a courtroom-style debate.**
> Style: energetic courtroom battle anime BGM, driving synth bass, staccato strings, brass stabs, punchy drums, 138 bpm, D minor, tense but fun, instrumental, loopable, no vocals

**`secondterm`: Act 3, the same school a little older.**
> Style: bittersweet coming-of-age anime BGM, piano and acoustic guitar, soft drums, airy strings, 90 bpm, D major, reflective, hopeful, a little sad, instrumental, loopable, no vocals

**`musicbox`: the title screen and the true ending.**
> Style: delicate music box lullaby, solo celesta and music box, very soft reverb, 60 bpm, D minor, innocent, fragile, slow, instrumental, loopable, no vocals

## Leave these to the synth
`drone`, `hum`, `heartbeat`, `office` and `lullaby` are built to misbehave: notes skip, wrong notes land, the heartbeat speeds up. A recording can't do that. You can still override them through the manifest if you want to.
