# After Class — notes for Claude

A meta-horror dating sim, built as a web game (vanilla JS, ES modules) and packaged with Electron. Design lives in `VISION.md`: read it before changing story, characters or any meta-horror effect.

## Stack and layout
- No framework or bundler. `index.html` loads `src/main.js` as a module. Electron main process is `electron/main.js` (CommonJS), with `electron/preload.js`.
- `src/`: `main.js`, `engine.js`, `story.js`, `story_act3.js`, `meta.js`, `minigames.js`, `persist.js`, `audio.js`, `config.js`, `script-helpers.js`.
- `styles/game.css`, `assets/` (bg, sprites per character, voice/office).
- `itch/` holds store page, devlogs, art and trailer scripts. `tools/` holds Python helpers for the Office voice lines.

## Run and build
- Quick browser test: `python -m http.server 8080` in this folder (see `.claude/launch.json`).
- Desktop: `npm start`. Release build: `npm run dist` (portable `After Class.exe` into `dist/`).
- No test suite is set up. After a change, say what to click through to check it.

## Rules
- Meta-horror effects are placed deliberately in the script. Never make one fire at random.
- Keep the cute/wrong label pairs in the quick menu (`index.html`) in sync when changing UI text.
- When bumping the version, update `package.json` and the `?v=` cache-busters in `index.html` together.
- Do not commit secrets. `.env` and `node_modules/` are ignored, so keep API keys in environment variables only.
- Do not edit or regenerate anything in `dist/`, `itch/*.zip` or `test-results/`.
- Ask before adding npm dependencies.

## Not here
Progress logs and old devlogs go in `itch/DEVLOG_*.md` or a `PROGRESS.md`, not in this file. Keep this file under about 100 lines.
