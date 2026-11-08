/**
 * main.js — Boots After Class.
 */
import { Game } from "./engine.js?v=2.2.0";
import { persist } from "./persist.js?v=2.2.0";

const game = new Game();
// Exposed for debugging from the console. (The girls leave messages there too.)
window.__afterClass = { game, persist };
// 2.2: if the game "crashed" last time, it comes back to the same moment, and they know.
if (persist.data.crash && persist.data.crash.snap) game.dread.recover();
else game.title();
