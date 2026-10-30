# AFTER CLASS — Vision Document

> *A campus romance that knows it is being played.*

## 1. What you're actually building

Underneath the bugs, the game already has a strong, original spine:

- **The surface story:** a dark campus mystery. Professor Richardson is dead and the ruling was suicide. Three women each hold one piece of the truth: **Maya** (surveillance), **Chloe** (power and money), **Hana** (art and witness).
- **The real story:** none of it is real. **The Archive** is a system that has run this story 847 times. It writes the girls' lines and resets the loop. It records *you*: your name, how long you play, when you switch tabs, what you skip.
- **The twist:** the girls are starting to **remember**. Each one notices the script in her own way. Maya sees it in the logs, Chloe in the rehearsed speeches, Hana in paintings that change when she isn't looking.
- **The key:** `RICHARDSON_7734`. Richardson wasn't only the victim. He was the **architect** who built the Archive and "loved them enough to let them go." That is the best idea in the project. Build everything toward it.

**Right now the game is a mystery thriller with meta-horror sprinkled on top, and almost no dating sim.** There's no affection system you can feel, no dates, and no time spent with anyone *after class*. Yet the title promises exactly that. The horror can't hurt if the player never fell for anyone.

### The one-line pitch
*You have one semester to fall in love and solve a murder. The Archive has watched you try 847 times, and this time the girls remember.*

---

## 2. Design pillars

### Pillar 1: Earn the love before you break it
The first playthrough has to work as a **sincere** romance and mystery. Warm scenes, real chemistry, choices that matter. If Act 1 is already glitching, the glitches mean nothing. Restraint is the scare.

> Current problem: ambient glitches, red flashes, "THE ARCHIVE IS WATCHING" and console taunts fire from minute one. Hold almost all of it back until after the first ending.

### Pillar 2: The horror lives in the interface
The scariest things are the parts players trust: the name box, the save slots, the choice buttons, the text box, the tab title, the browser itself. You already have most of these tricks (tab-switch detection, clipboard puzzle, title changes, console messages, play-time callouts, history push). Treat them as a **budget**. Use each trick once, at the right moment, and make it mean something in the story.

### Pillar 3: Each girl's route is her own relationship to the Archive
This is already in your writing. Formalize it:

| | Surface role | How she "wakes up" | Her meta mechanic |
|---|---|---|---|
| **Maya** | Watches the cameras | Finds the loop in the logs | She can **see your save files**. She comments on slots, reloads, and the time you've played. Her route is about being watched and watching back. |
| **Chloe** | Controls the narrative | Realizes her speeches are rehearsed | She **rewrites choices**. Buttons change under your cursor, and she picks for you "to win." Her route is about control versus consent. |
| **Hana** | Paints the truth | Her paintings change by themselves | She **paints the game**. Backgrounds and sprites degrade, she draws *you*, CGs become her canvases. Her route is about being seen as a person, not an image. |

### Pillar 4: You are the variable, not Alex
Alex is the vessel. The name the player types in is who the Archive is talking to. "Welcome back, Alex. Or should I say… Bryan" is the core beat. Make name entry impossible to miss, and save the reveal for the moment it lands hardest.

---

## 3. Structure: three loops

### Loop 1: *The Semester* (first playthrough)
- About 5 in-game days. Each day has class, an **after-class slot** (the dating part: pick who to spend time with), and an investigation beat.
- You already have the systems for this: `TimeSystem`, `RelationshipSystem`, `StatSystem`, `activities.json`, plus `CampusScene`, `BedroomScene` and `EndOfDayScene`. Most of them aren't used yet.
- Trust or affection per girl decides which route ending you get: Watcher, Winner, or Silent Witness, plus good and bad versions of each.
- Meta use: **almost zero**. Maybe one line that's *slightly* wrong, which players only notice on a replay.

### Loop 2: *The Rerun* (after any ending)
- The title screen has changed. The girl whose route you finished **remembers** you. The `???` hidden choices start to appear, and each one costs "awareness."
- Lines you already read play back faster, as if the Archive is bored. Skipped text gets called out.
- The Archive interlude (`meta_interlude`) plays here, **not** on the first run.

### Loop 3: *The Archive* (true route)
- Unlocked by **knowledge gathered across runs**: fragments of Richardson's password hidden in each girl's route (the `R.F.F.` carving, the `MONDAY_ARCHIVE` folder, Hana's dated sketches). Never by a hint printed on the title screen.
- Endings: **Preserve** (seal the loop), **Burn** (delete everything), **True** (`RICHARDSON_7734`: break the loop without breaking them).

---

## 4. Art direction

Every temporary asset currently comes from a different pack and style, and they contradict the character bios:

| Character | Bio says | Current sprite |
|---|---|---|
| Maya | South Asian, CS student, guarded | Red hair, red eyes, ornate black and gold coat |
| Chloe | Black, campaign queen | Purple drill-hair "vampire bride" with fangs |
| Hana | East Asian, withdrawn art student | Blonde twin-tails, purple hoodie |
| Alex | Quiet, observant | Open-shirt pin-up on the title screen, and a different boy with glasses on the start screen |

The backgrounds also clash: the campaign office is flat and bright like a cartoon, while the archive and gallery are dark and painterly.

**Direction:** one consistent anime VN style. Muted, moody palette. Warm practical lights (desk lamps, monitor glow) against deep shadow. Each girl has a signature color that the **corruption** later poisons: Maya violet, Chloe crimson, Hana teal (these already exist in `characters.json`).

**Asset list per girl:** 6 to 8 expressions, plus 2 to 3 **corrupted** variants (eyes too wide, missing mouth, smeared paint for Hana, scan-line tearing for Maya, "copy-pasted" duplicate for Chloe). Add 2 CGs per route and one shared Archive CG.

**License note:** the studentspub sprites require a credit in-game (see the `*_Itchio_Description.txt` files).

---

## 5. Bug list (from a live playthrough and code read, Oct 31)

### Critical: endings are broken (fixed Oct 31: items 1–6)
1. **Route endings can never trigger.** `DialogueSystem._applyEffects` strips the `flag_` prefix, so `flag_ending_maya` is stored as `ending_maya`. But `main.js:_showEnding` reads `getFlag("flag_ending_maya")`, which is always false. Every run falls through to **Truth Ending**.
2. **Trust is always 0, and it can't grow.** Same prefix bug for `flag_maya_trust`, `flag_chloe_trust` and `flag_hana_trust`. On top of that, `setFlag(..., 1)` *sets* the value to 1 instead of adding 1, so the threshold of 3 is unreachable. Use `rel_maya: +1`, which goes through `modifyRelationship`, instead.
3. **The true ending was unreachable.** Typing `RICHARDSON_7734` as your name started a dialogue that doesn't exist (`meta_true_ending`), so the game froze. Even on a normal start, the unlock flag was wiped by the new-game reset, and the true-ending node never set `meta_ending`.
4. **The title screen gives away the secret.** `V0StartMenuScene.js:51` prints the hint "The archive remembers... RICHARDSON_7734".

### Major: flow and presentation
5. **Every choice is echoed as an "Alex" line** (`DialogueSystem.js:150`), so you click "Read the intro" and then have to click through "Read the intro" again. That doubles the clicks and kills the pacing.
6. **Narration is labeled "Alex"** and shows Alex's portrait. Narration needs no speaker plate. Alex should be a side portrait or not shown at all.
7. **Hana appears twice.** Almost every Hana node sets `cg` to her own portrait, so the CG and the sprite stack on top of each other. `hana_masked` uses *Maya's* surprised portrait as its CG.
8. **Meta voice text is broken.** In the meta voice overlay, `{PLAYER_NAME}` isn't replaced in the appended stats text, and the lines contradict each other ("Rushing… barely skipped… actually read everything", "0 minutes"). `UIManager._formatDialogueText` also hardcodes `playerName = "Alex"`.
9. **Repeated sentences in the script** ("For a moment you think you hear someone breathing…" appears twice, and so do lines in the prologue). It looks like a patch script ran twice.
10. **Dead or orphan nodes.** `chloe_end` and `hana_end` have no choices, `next` or `isEnd`. There's an unused duplicate `maya_end` in `chapter2_maya`.
11. **The Burn ending runs `localStorage.clear()`.** On GitHub Pages every project under your `*.github.io` domain shares one origin, so this wipes **other sites' data too**. Clear only `afterclass_*` keys.
12. **Ambient meta fires on the first run**: random glitches, a 5-minute fourth-wall timer, and the tab-watcher. See Pillar 1.

### Housekeeping
- `uimanager.js` at the repo root is a stale, *different* copy of `src/systems/UIManager.js`. Delete it.
- Duplicate backgrounds with typo names (`archuive`, `campagin office`, `gallery .jpeg`, `security contoro room`, `old research builkding`). Keep one clean-named copy of each.
- `Char_CharSheet_*.png` files run up to 27 MB, and each portrait is about 1.3 MB. Compress portraits to WebP at about 1200 px, and keep the sheets out of the deployed build.
- `fix_all.py`, `update_meta_dialogue.py` and `test.html` are one-off patch scripts. Remove them or move them to `/tools`.
- `ASSET_GUIDE.md` describes a "cozy Stardew" pixel game with folders that don't exist. Replace it with section 4 of this document.
- `.claude/launch.json` hardcodes port 8080 in the args, so it breaks when the port is busy.
- `UIManager.js` is 2,500 lines. Split out `MetaSystem` (all fourth-wall tricks), `PortraitRenderer` and `AudioManager`.

---

## 6. Suggested order of work

1. **Fix the critical bugs (1–4) and the choice echo (5).** Then the existing game actually works end to end.
2. **Gate all meta behind `playthrough_count >= 1`.** That one change creates Loop 1 versus Loop 2.
3. **Add the after-class dating slot**, using the existing Time and Relationship systems. Two short hangout scenes per girl.
4. **Lock the art direction** and replace the sprites one character at a time. Start with corrupted variants of the current art to prototype the effect.
5. **Write the password fragments** into each route, and remove the title-screen hint.
6. **Split `UIManager`** while adding the per-girl meta mechanics from Pillar 3.
