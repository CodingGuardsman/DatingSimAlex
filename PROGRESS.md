# Playtest triage (2026-11-13)

## Bleed sprites: keep (decided 2026-11-13)
The user chose to keep the bloody `bleed` sprites. Their alignment is now fixed with a `pose-full` class (`src/engine.js` `FULL`, `styles/game.css`). The original notes follow.

**The girls' `bleed` sprites are covered in blood.** That breaks the "no gore on the girls" rule.
- Art: `assets/sprites/{hina,rei,sayo}/bleed.webp`
- Used at `src/story.js:1940-1943` (Hina and Rei), `:2041` (Sayo) and `:2213-2218` (the erased girl).
- They are also misaligned. They are full-body art at a smaller scale, so swapping from `neutral` makes the girl shrink and her head jump. Sayo's is also off-centre.
- I did not realign them, in case you want them replaced (for example with an analog-glitch `corrupt` look and no blood).

## Items

| # | Item | What it is now | Type | Size | Status |
|---|------|----------------|------|------|--------|
| 1 | Animated CGs look bad | `_frameLoop` (`src/meta.js:137`) | Bug + art | S code / M art | Timing fixed; art list below |
| 2 | Misaligned scenes | Sprite framing (`engine.js:22-23`, `game.css` pose rules) | Bug | S | 2 fixed, bleed held |
| 3 | Other names | `askName` (`src/engine.js:600-615`) | Design ask | S | Waiting on you |
| 4 | Two infirmary options | `src/story.js:1988` menu | Bug | XS | Fixed |
| 5 | Only one girl blinks | `_startBlink` (`src/engine.js:1386`) | Bug, cause unconfirmed | S-M | Investigated |
| 6 | Deleted Office comes back | Recess → `a3_start` | Design gap | S | Waiting on you |

### 1. Animated CGs
- The frames don't shift the subject. Each frame is a full redraw.
- Calm (non-`h_`) CGs were swapping drawings every 120-320 ms, so the cute scenes looked like they were boiling.
- **Fixed:** calm CGs now hold each frame for 0.8-1.7 s (`src/meta.js:150`). Horror timing is unchanged.
- **Still bad art.** I measured the mean pixel change per frame:
  - Worst: `m_hina_4`, `m_rei_4`, `m_sayo_4` (17-20). Each frame is a different face, so they are still jumpy even when slowed. Suggest dropping them from `_frames()` or redrawing them as edits of one base image.
  - Next: `cute_hina_desk` (7). Her pose and hair are redrawn on every frame.
  - The `h_*` set (10-15) reads as glitch, which is fine for analog-glitch horror.
  - I did not touch the `_frames()` line, because the `h_stalk_*` entries belong to another session.

### 2. Misalignment
- **Fixed:** Hina's `lean_blush` is framed like `lean` but wasn't in `WIDE`, so going from `lean` to `lean_blush` changed her size (`src/engine.js:23`).
- **Fixed:** Nurse Mori's figure sits left of centre in her canvas, at x≈434 of 1100. She is now nudged onto her mark (`styles/game.css`, `[data-who="nurse"]`).
- **Held:** the bleed sprites (see the top section).

### 3. Different names
- Special routes exist only for K, Hina, Rei, Sayo and Office (`src/engine.js:614`, `named_girl` at `src/story.js:314`). Any other name gets no reaction.
- On a rerun, `askName` reads the old name into `prev` (`:601`) and then overwrites it at `:612`. Nobody notices that you changed your name.
- **Done (2026-11-13).** `askName` saves the old name as `wasName` when it changes (case changes don't count). `r_start` in `src/story.js` plays two lines about it once (Hina, or Rei if Hina is erased), using a new `{was}` variable (`src/meta.js` `vars()`), then clears it.
- **Proposal:** save the previous name. In `r_start`, if it differs, play 2-3 lines (Rei: "Last time you were {old}."). It is a small script change and stays deliberate.

### 4. Two infirmary options
- **Fixed.** The menu showed a fleeing decoy (`flee: true`) beside a plain copy of the same choice, so it read as a duplicate. "Go find Sayo" had the same problem.
- Now there is one fleeing button. It dodges four times, then lets you click it (`src/story.js:1988`).

### 5. Only one girl blinks
- The code and art are fine for all three girls:
  - `blink.webp` is a proper closed-eye frame for each of them (I checked eye crops at full size).
  - Blinking runs whenever a sprite's `dataset.expr === "neutral"` and the UI isn't uncanny or still.
- **Likely cause:** a speaker line with no expression keeps the last one (`src/engine.js:1042`), so a girl only blinks while her current face is `neutral`. Hina is `happy` 17 times; Rei is often `photo` or `annoyed`; Sayo is often `draw` or `happy`. The live probe was blocked by the browser pane, so this is **not confirmed**.
- **Done (2026-11-13).** New frames `assets/sprites/<girl>/blink_<expr>.webp` were made by pasting the closed eyes from `blink.webp` onto the calm faces (Hina: happy, worried; Rei: soft, annoyed, photo; Sayo: happy, draw, draw_happy). `_startBlink` in `src/engine.js` now blinks on those faces too. Skipped: sad (tears), blush, and Rei's laugh (eyes already closed).
- **Fix options:**
  - (a) blink frames for the common calm faces (happy, soft, draw…), which needs art;
  - (b) map more calm expressions to the neutral blink (cheap, but the face pops for 140 ms).

### 6. Deleting the Office
- Recess saves `lastEnding = "recess"` (`src/engine.js:1547`). That only changes the title subtitle and background (`:299`, `:314`).
- "Back to class" then runs `a3_start` (`:356`), which plays the normal summer-return scene with the Office in it. Nothing mentions the deletion.
- The script already says the Office returns when you press the button again (`src/story_act3.js:1293-1296`). That line only plays in the Retention route.
- **Done (2026-11-13): option (a).** `a3_start` in `src/story_act3.js` now opens on the roof when `lastEnding === "recess"`: the Office restores itself from backup and the bell rings. It plays once, then sets `lastEnding` to `"restored"` so the title goes back to "second term".
- **Options:**
  - (a) add a short beat at `a3_start` when `lastEnding === "recess"`, where the Office reinstalls itself (S);
  - (b) persist an `officeDeleted` flag so it stays gone. This is big: all of Act 3 runs through the Office, and it contradicts the existing line.

## Big features (plan only, not started)
1. **Rewind saves notice other programs.**
   - **Built (2026-11-13), not yet tested in the desktop app.** `electron/main.js` `runningApp()` matches process names against a fixed allowlist and returns one display name. Bridge: `native.runningApp` (`electron/preload.js`). `meta.otherApp` and `{app}` (`src/meta.js`). Settings switch `notice` and the Load-screen label (`src/engine.js`). Script: `labelApp` and two Office lines in `d_fake_save` (`src/story_dread.js`). Codex wrote the back end and reviewed the day's edits; its two findings on the name-change lines are fixed.
   - In `electron/main.js`, list running process names once at launch (`tasklist` / `ps`) and match them against a small hard-coded allowlist of well-known games and apps (Steam, Discord, OBS…).
   - Pass only the matched display name through `preload.js`.
   - Never read window titles. Nothing leaves the machine. Add an opt-out in Settings. Browser builds skip it.
   - Size: M.
2. **Recover the forgotten girl yourself.**
   - **Designed 2026-11-13, not built (usage limit reached).** Findings: the erased girl stays gone until the Summer ending (`src/story.js:2155`, `pset("erased", null)`), and the Office desktop with K's bin only exists in Act 3, after she is already back. So the bin has to live on the title screen.
   - Design: when `P.erased` is set, the title shows a small Recycle Bin button (like `door-btn`, `src/engine.js:~328`). It opens a bin window listing her student record, "deleted by THE OFFICE. Reason: least engaged". Restore asks once ("scheduled for consolidation, restore anyway?"), then sets `erased` to null and a new `recovered` flag, and redraws the title with her back on her mark.
   - Then `r_start` (`src/story.js`) needs a short return scene when `P.recovered` is set. Scenes already check `P.erased` live through `without()`, so she reappears everywhere else by herself.
   - All front end and script, no back end. Codex should review it after.
   - Reuse the K recycle-bin pattern (`src/minigames.js:812`, `restoredK`): her files appear in the desktop's bin, and restoring them clears `P.erased`.
   - Plus a scene for her return.
   - Size: M-L (script + minigame).
3. **Exciting music for certain parts.**
   - `assets/music/manifest.json` and `tools/prep_music.py` already support recorded tracks.
   - Needs the tracks (which parts?) plus `music()` cues.
   - Size: S code, plus sourcing the music.
4. **Animated title-screen inspection.**
   - Polish the title hover/inspect (`src/engine.js:~300-440`): idle animation and parallax.
   - Size: M, front end.
5. **Prettier, animated hearing scene.**
   - Restyle the `.mg-listen` minigame (`styles/game.css:1035`, `src/minigames.js`).
   - Size: M, front end.
6. **Voice replies to the microphone.**
   - `senses.js`, `ai.js` and `.mg-listen` already exist.
   - Add speech-to-text, then a short `ai.js` reply, then playback with the existing voice lines or TTS.
   - Needs a choice of STT/TTS provider and maybe a dependency, so ask first.
   - Size: L.
