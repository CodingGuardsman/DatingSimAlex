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

## Code map
| File | What it does |
|---|---|
| `src/story.js` | **The whole script.** Lines look like `"hina happy\| Hello {name}!"`; commands are helper calls such as `pa()`, `fx()`, `menu()` and `when()`. |
| `src/engine.js` | Script runner, dialogue box, menus, save/load, settings, backlog, title screen |
| `src/meta.js` | Every fourth-wall effect and the real-world variables (`{clock}`, `{away}`, `{clicks}`…) |
| `src/audio.js` | Procedural music (`day`, `evening`, `wrong`, `musicbox`, `drone`, `hum`), sound effects, voice blips and the Office's speech synthesis. There are no audio files. |
| `src/persist.js` | Saves and cross-playthrough memory, all under the `ac2_` localStorage prefix |
| `assets/sprites/<girl>/<expr>.webp` | 6 expressions per girl, including a `corrupt` one |
| `assets/bg/*.webp` | classroom, hallway, rooftop, riverside, infirmary, darkroom, beach |

All art was generated for this project with AssetHub (canvas "After Class - meta horror VN art"). The music is generated live in the browser.

**Testing tip:** `__afterClass.persist.forgetAll()` in the console resets every playthrough. `__afterClass.game.start("r_start")` jumps straight to Act 2.

## Next ideas
- Add a 4th afternoon scene for each girl in Act 2. Right now each girl has one.
- Add a CG or two: the three girls on the beach seen from behind, and K's last photo.
- Add a sound pass with real voice acting for key lines, if you ever get a VA.
