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

// 2.3: line boil. Every full-screen illustration wobbles like it is being redrawn by hand, a few frames a second, in hard steps
// (Slay the Princess does this). Horror CGs boil harder. Reduced-motion players get still pictures.
{
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.style.position = "absolute";
    svg.innerHTML = `<filter id="boil" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence id="boil-n" type="fractalNoise" baseFrequency="0.011 0.014" numOctaves="2" seed="1" result="n"/><feDisplacementMap id="boil-d" in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>`;
    document.body.appendChild(svg);
    const noise = svg.querySelector("#boil-n"), disp = svg.querySelector("#boil-d");
    const css = document.createElement("style");
    css.textContent = "#cg, .behind-strip { filter: url(#boil); } #cg .cg-img, .behind-strip > div { transform-origin: 50% 50%; }";
    document.head.appendChild(css);
    let seed = 1;
    setInterval(() => {
      const cg = document.getElementById("cg"), behind = document.querySelector(".behind");
      if (!(cg && cg.firstChild) && !behind) return;
      const horror = behind || /^h_/.test(game.v.cg || "");
      seed = seed % 9 + 1;
      noise.setAttribute("seed", String(seed));
      disp.setAttribute("scale", String(horror ? 11 : 4));
    }, 120);
  }
}
