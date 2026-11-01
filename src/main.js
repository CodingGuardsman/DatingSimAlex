/**
 * main.js — Boots After Class.
 */
import { Game } from "./engine.js?v=2.0.0";
import { persist } from "./persist.js?v=2.0.0";

const game = new Game();
// Exposed for debugging from the console. (The girls leave messages there too.)
window.__afterClass = { game, persist };
game.title();
