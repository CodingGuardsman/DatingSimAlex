// Drives a headless Chromium over CDP and saves 1920x1080 store screenshots + trailer stills.
// usage: node itch/capture_shots.mjs <outdir>
// Needs the game served on http://localhost:8080 and a Chromium started with --remote-debugging-port=9334.
// Copy 0*.png into itch/screenshots and t-*.png into itch/trailer-stills.
import fs from "node:fs";
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const list = await (await fetch("http://127.0.0.1:9334/json")).json();
const page = list.find(t => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener("open", r));
let id = 0;
const send = (method, params = {}) => new Promise(resolve => {
  const myId = ++id;
  ws.addEventListener("message", function h(ev) {
    const m = JSON.parse(ev.data);
    if (m.id === myId) { ws.removeEventListener("message", h); resolve(m.result); }
  });
  ws.send(JSON.stringify({ id: myId, method, params }));
});
const run = async expr => {
  const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400));
  return r.result.value;
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shot = async name => {
  const r = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
  console.log("saved", name);
};

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
// Fresh profile: set up a first-run player, then reload so the game boots with it.
await send("Page.navigate", { url: "http://localhost:8080/?full" }); await sleep(2500); await run(`localStorage.clear(); true`);
await send("Page.navigate", { url: "http://localhost:8080/?full" });
await sleep(2500);
await run(`(() => {
  const P = __afterClass.persist;
  P.data.warned = true; P.data.name = "Haru"; P.data.runs = 0;
  P.data.settings.voice = false; P.data.settings.music = 0; P.data.settings.sfx = 0; P.save();
  return true; })()`);
await send("Page.navigate", { url: "http://localhost:8080/?full" });
await sleep(2500);
await run(`(() => {
  const g = __afterClass.game;
  // Advance until pred() is true. Choices: pick the one matching window.__pick, else the first.
  window.__adv = async (pred, n = 600) => {
    for (let i = 0; i < n; i++) {
      if (pred()) return true;
      const ch = [...document.querySelectorAll('#choices .choice')];
      if (ch.length && document.querySelector('#choices').style.display !== 'none') {
        const want = window.__pick ? ch.find(c => window.__pick.test(c.textContent)) : null;
        (want || ch[0]).click(); await new Promise(r => setTimeout(r, 80)); continue;
      }
      if (g._typing) g._finishTyping = true;
      if (g._waitingClick) g._advanceClick(true);
      await new Promise(r => setTimeout(r, 40));
    }
    return false;
  };
  window.__text = () => document.querySelector('#say-text').textContent;
  g.title();
  return true; })()`);
await sleep(3000);
await shot("01-title");

const scene = async (label, untilText, name, { pick = null, extra = "", wait = 1400 } = {}) => {
  const ok = await run(`(async () => { const g = __afterClass.game; document.getElementById("fx").innerHTML = "";
    document.getElementById("game").className = ""; window.__pick = ${pick ? pick.toString() : "null"};
    g.start(${JSON.stringify(label)}); ${extra}
    await new Promise(r => setTimeout(r, 2600));
    const ok = await __adv(() => __text().includes(${JSON.stringify(untilText)}));
    g._finishTyping = true; return ok; })()`);
  if (!ok) console.log("!! did not reach", untilText);
  await sleep(wait);
  await shot(name);
};

await scene("a1_mon", "Hey! Transfer student!", "02-hina");
await scene("a1_mon", "I only keep the good ones.", "03-rei");
await scene("hina1", "Item nine.", "04-river", { pick: /ocean/ });
await scene("sayo2", "I want to remember your face", "05-sayo", { pick: /believe/ });
await run(`(async () => { const g = __afterClass.game; document.getElementById("fx").innerHTML = ""; g.start("a1_choice"); await new Promise(r => setTimeout(r, 2000));
  for (let i = 0; i < 200 && document.querySelector('#choices').style.display !== 'flex'; i++) { if (g._typing) g._finishTyping = true; if (g._waitingClick) g._advanceClick(true); await new Promise(r => setTimeout(r, 50)); } return true; })()`);
await sleep(1200);
await shot("06-choice");
await scene("a1_fri", "Item thirteen.", "07-rooftop", { extra: `g.v.aff = { hina: 9, rei: 0, sayo: 0 }; g.v.picked = ["hina"];` });
await scene("rei3", "not completely here", "08-blurred", { pick: /here/ });

// Trailer-only stills
await scene("a1_fri", "Say something before I throw", "t-rei-roof", { extra: `g.v.aff = { hina: 0, rei: 9, sayo: 0 }; g.v.picked = ["rei"];` });
await scene("a1_fri", "one sunset with you", "t-sayo-roof", { extra: `g.v.aff = { hina: 0, rei: 0, sayo: 9 }; g.v.picked = ["sayo"];` });
// The Office announcement (banner visible, voice off).
await run(`(async () => { const g = __afterClass.game; document.getElementById("fx").innerHTML = ""; window.__pick = null; g.start("a1_mon"); await new Promise(r => setTimeout(r, 2600));
  await __adv(() => !!document.querySelector('.pa-banner')); return true; })()`);
await sleep(900);
await shot("t-pa");
ws.close();
