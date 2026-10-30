/**
 * main.js — Boots After Class.
 */
import { Game } from "./engine.js";
import { persist } from "./persist.js";

const game = new Game();
// Exposed for debugging from the console. (The girls leave messages there too.)
window.__afterClass = { game, persist };
game.title();
