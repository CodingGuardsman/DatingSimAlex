/**
 * main.js — Boots After Class.
 */
import { Game } from "./engine.js?v=2.3.0";
import { persist } from "./persist.js?v=2.3.0";

const game = new Game();
// Exposed for debugging from the console. (The girls leave messages there too.)
window.__afterClass = { game, persist };
// 2.2: if the game "crashed" last time, it comes back to the same moment, and they know.
if (persist.data.crash && persist.data.crash.snap) game.dread.recover();
else game.title();

// 2.3: the room leans toward the cursor, a few pixels. Cute scenes only; the uncanny UI stays dead still.
{
  const g = document.getElementById("game"), bg = document.getElementById("bg");
  let tx = 0, ty = 0, x = 0, y = 0;
  if (g && bg && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    addEventListener("mousemove", e => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; });
    (function tick() {
      const still = g.classList.contains("uncanny") || g.classList.contains("mood-still");
      x += ((still ? 0 : tx) - x) * 0.05; y += ((still ? 0 : ty) - y) * 0.05;
      bg.style.translate = `${(-x * 22).toFixed(1)}px ${(-y * 14).toFixed(1)}px`;
      requestAnimationFrame(tick);
    })();
  }
}
