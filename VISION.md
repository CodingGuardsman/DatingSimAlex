# AFTER CLASS — Design Doc

> *A dating sim about the last week before summer. Summer never comes.*

## Premise
You transfer into Hoshimi Academy for the last week of term. You have five afternoons, and each day after class you choose who to spend it with:

| | Who she is | How she remembers the loop |
|---|---|---|
| **Hina Amamiya** | Sunny class rep with a summer list | She **counts**: your clicks, your tab-outs, how long you were away. Her summer list has an item she didn't write: *12. Don't let K leave.* |
| **Rei Kurosawa** | Sarcastic photographer, shoots film | She **looks**: a blurred figure stands in every photo she takes. In Act 2 she photographs *your* screen and watches your cursor. |
| **Sayo Shiraishi** | Quiet girl from the infirmary | She **draws**: textboxes, doors, you. She's been aware the longest, and she knows the way out. |

**The Office** is the school PA system. It speaks out loud in a synthesized voice. It keeps the week looping so somebody keeps playing.

**K** is the player who came before you. K played for 412 hours, then stopped. K's save slot is always in your Load menu.

The core question: *what happens to characters when the player stops playing?* They sit in the dark. The true ending is to let them have summer, by looking away.

## Structure
- **Act 1, "The Last Week"** (first playthrough): a sincere romance. Small things go wrong: K in Rei's photos, Hina calling you "K", Thursday's announcement repeating Monday's word for word, Sayo appearing in a seat nobody else can see. On Friday, at the confession, the Office postpones summer. The story rewinds, the fake credits tear, and you get **Ending 1: Summer Never Comes**.
- **Act 2, "The Rerun"** (every playthrough after the first): the girls remember. The Office fights back.
- **Endings**:
  - **Detention** (bad): stay.
  - **Summer** (true): say goodbye, then actually look away. Switch tabs for 20 seconds, or don't touch anything for 75. After that, the title screen is permanently "closed for summer vacation".
  - **K's message**: opening the K save in Act 2 unlocks an extra Friday choice.

## Meta-horror catalogue
Every effect is placed in the script deliberately. Nothing fires at random.

| Effect | Where |
|---|---|
| The Office speaks aloud, using your name and the real clock | PA announcements, Act 1 and Act 2 |
| The same announcement repeats on Thursday | Act 1, Thursday |
| A ghost figure appears in the background | Rei's photos, K |
| Your real local time, time away and late-night play are quoted | Act 2 opening |
| Click counter and tab-out counter | Hina's rerun scene |
| Screen size, a cursor reticle that follows the mouse, a "your reflection" bit | Rei's rerun scene |
| A real downloadable `sayo_letter.txt` | Sayo's rerun scene |
| Lines edited mid-sentence, with the original kept struck through in the backlog | Hina's rerun scene |
| Fake "not responding" crash dialog | Act 2 Thursday |
| Hijacked choices (all options become "Stay.") and a choice that runs from your cursor | Act 2 Thursday |
| A VHS rollback through the backlog | Act 1 Friday |
| End credits that tear apart | Act 1 ending |
| The K save slot, plus K's lines appearing in your backlog | Load menu, Log |
| Empty save slots relabelled "DON'T", "PLEASE"… | Act 2 |
| Settings sabotage: you can't mute them | Act 2 |
| Messages in the browser console | Throughout |
| Tab title changes when you leave ("come back") | Act 2 |
| Idle whispers if you stop clicking | Act 2 |
| "Again" instead of "New Game", a staring Sayo, a red detention title | Title screen |
| Naming yourself "K" | Name entry |
| The true ending requires you to stop watching | Ending |

## The two faces of the UI
Everything looks like a sweet pastel romance by default: notebook-paper menus with washi tape, a polka-dot text box with a heart that bounces when a line is done, heart-shaped day dots, a cheerful yellow "ding-dong" PA notice and a little heart cursor. When the story goes wrong (the Thursday repeat, the rewind, all of Act 2, and the space behind the menu), `#game.uncanny` swaps every piece for its twin:
- The hearts become eyes and ✕ marks, and the cursor turns dark with an eye on it.
- The rounded corners go square, the name tags tear, and the menus turn dark.
- The quick-menu labels change: Log → remember, Auto → stay, Skip → don't, Save → save us, Load → rewind.

Wednesday's "K?" slip flashes the uncanny UI for a split second and then pretends it didn't happen. The UI goes back to cute on the beach.

## Minor characters and the week
Act 1 days now have a homeroom or morning scene, a group lunch, an afternoon with one girl, and a group-chat phone scene at night. The minor characters never remember anything, so in Act 2 they repeat their Act 1 lines word for word:
- **Kanda-sensei**, the tired homeroom teacher. A K is rubbed out of her register.
- **Daichi**, Hina's neighbor, who has a napkin map of the beach.
- **Nurse Mori**, whose sign-in book has only Sayo's name in it, every page dated this week.
- **Mrs. Okada** at the konbini, who always asks "same as yesterday?"

## The Summer Scrapbook (player effort)
There are 35 memories in four books: Hina's summer list, Rei's photos, Sayo's sketchbook, and keepsakes. Each one comes from a choice, an afternoon visit or a discovery. For example, Hina whispers that Daichi always throws rock, and choosing Paper checks off "Beat Daichi at something".

One week can't hold every memory, and the scrapbook survives "Forget them" or "Start over", so collecting everything takes several playthroughs. The payoffs:
- The girls quote your count.
- Every ending card shows it.
- With 30 or more memories, the true ending leaves a color photo of all three girls, in focus.

## Behind the title screen (the big meta trick)
The title screen is a real place:
- **Act 1:** if you leave the menu alone for 40 seconds, Sayo's face slips for a fraction of a second. Sayo's sketchbook has a drawing of "three girls in a row, smiling at nobody, five rectangles under them".
- **After the first ending:** Sayo draws a pencil "door" button next to the menu, and the girls hold their pose only while you're moving. After about 11 seconds of stillness they stop smiling, and Sayo reaches toward the screen. Handwriting appears: "we can hear the menu music the whole time." Any movement snaps them back instantly.
- **The door:** clicking it swings the menu open like a double door. Behind it, the three girls stand in the dark on tape marks. They quote how long you've left the menu open, how many times you hovered over Quit, and how often you nearly caught them out of pose. Act 2 brings it up afterwards.
- **In the free demo:** the door works too, so the demo ends on a hook.

## Free demo vs full game
The web version on GitHub Pages is a **free demo**. It contains all of Act 1, up to the first ending, "Summer Never Comes", and then shows an "End of the free demo" screen that links to the store. Act 2, K's save and the other two endings are only in the paid `.exe`. The store link lives in `src/config.js`. Add `?full` to the web URL to test the full game in a browser.

## Desktop build (After Class.exe)
Run `npm start` to play it as a desktop app, and `npm run dist` to build a portable `dist/After Class.exe`. The web version on GitHub Pages keeps working, and these extras only switch on in the .exe:

| Effect | Where |
|---|---|
| A **Hoshimi Academy** folder appears next to the .exe | First file: Hina's list (Act 1, Wednesday) |
| `hinas_summer_list.txt` with "12. Don't let K leave". In Act 2 it's rewritten to "Let {name} leave", and she notices if you deleted it | Act 1, Act 2 Hina |
| `K.txt`, a note from K | After ending 1 |
| `rei_photo_of_you.png`, Rei's polaroid of the scene with the figure behind you | Act 2 Rei |
| `sayo_letter.txt` is written straight into the folder, and the folder opens on it | Act 2 Sayo |
| `gone_to_the_beach.txt`, and the game closes itself | True ending |
| Rei uses your PC's username, if it differs from the name you typed | Act 2 opening |
| An offer to open the folder (only if you choose it) | Act 2 opening |
| The real window shakes and jolts | Act 2 Thursday |
| Windows notifications from the Office when you alt-tab | Act 2 |
| The taskbar progress bar counts the days | Every day card |
| The first close attempt is blocked with Hina's plea. The second close always works | Act 2 |
| The Quit button really quits | Title |

The game only ever writes inside its own folder, and it never deletes anything.

## Code map
| File | What it does |
|---|---|
| `src/story.js` | **The whole script.** Lines look like `"hina happy\| Hello {name}!"`; commands are helper calls such as `pa()`, `fx()`, `menu()` and `when()`. |
| `src/engine.js` | Script runner, dialogue box, menus, save/load, settings, backlog, title screen |
| `src/meta.js` | Every fourth-wall effect and the real-world variables (`{clock}`, `{away}`, `{clicks}`…) |
| `src/audio.js` | Procedural music (`day`, `evening`, `wrong`, `musicbox`, `drone`, `hum`), sound effects, voice blips, and the Office's PA voice: recorded clips played through a ceiling-speaker filter, with the time and play time spliced from recorded numbers. Only the player's name uses the browser's speech synthesis. |
| `assets/voice/office/` | The Office's lines, recorded with Kokoro (Apache-2.0 neural TTS) by `tools/make_office_voice.py`. Re-run it after changing any `pa(...)` line in the script. |
| `electron/main.js`, `electron/preload.js` | Desktop shell and the small native bridge (`window.native`) |
| `src/persist.js` | Saves and cross-playthrough memory, all under the `ac2_` localStorage prefix |
| `assets/sprites/<girl>/<expr>.webp` | 6 expressions per girl, including a `corrupt` one |
| `assets/bg/*.webp` | classroom, hallway, rooftop, riverside, infirmary, darkroom, beach |

All art was generated for this project with AssetHub (canvas "After Class - meta horror VN art"). The music is generated live in the browser. The Office's voice is Kokoro (af_heart), an open-weight Apache-2.0 TTS model, so it's fine to use in the paid game.

**Testing tip:** `__afterClass.persist.forgetAll()` in the console resets every playthrough. `__afterClass.game.start("r_start")` jumps straight to Act 2.

## Next ideas
- Add a 4th afternoon scene for each girl in Act 2. Right now each girl has one.
- Add a CG or two: the three girls on the beach seen from behind, and K's last photo.
- Add a sound pass with real voice acting for key lines, if you ever get a VA.
