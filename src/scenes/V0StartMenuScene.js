/**
 * V0StartMenuScene.js - Animated start screen from v0 design.
 */
import Scene from "./Scene.js";
const MOTES_COUNT = 26;
export class V0StartMenuScene extends Scene {
  constructor(sm,eb,um,sl) { super(sm,eb,um,sl); this._boundKeyHandler=this._k.bind(this); }
  async enter(p={}) { this.p=p; this._started=false; this._b(); this._m(); this._a(); }
  _b() {
    const m=document.createElement("div");
    m.className="v0-start-main";
    m.style.cssText="position:relative;width:100%;height:100dvh;overflow:hidden;background:#000;cursor:pointer;user-select:none;-webkit-user-select:none;";
    m.setAttribute("role","button");m.setAttribute("tabindex","0");m.setAttribute("aria-label","Press to start");
    const a=document.createElement("div");a.className="anim-ambient";a.style.cssText="position:absolute;inset:0;animation:ambientlight 9s ease-in-out infinite;";
    const k=document.createElement("div");k.className="anim-kenburns";k.style.cssText="position:absolute;inset:0;background-size:cover;background-position:center;background-image:url('assets/images/backgrounds/classroom-hero.jpg');animation:kenburns 26s ease-in-out infinite;";a.appendChild(k);m.appendChild(a);
    const r=document.createElement("div");r.className="anim-rays";r.setAttribute("aria-hidden","true");r.style.cssText="position:absolute;inset:-25%;animation:raysdrift 14s ease-in-out infinite;background:repeating-linear-gradient(100deg,rgba(255,230,170,0.14) 0px,rgba(255,230,170,0.14) 2px,transparent 2px,transparent 26px);mix-blend-mode:screen;mask-image:radial-gradient(120% 90% at 15% 10%,black 0%,transparent 65%);-webkit-mask-image:radial-gradient(120% 90% at 15% 10%,black 0%,transparent 65%);pointer-events:none;";m.appendChild(r);
    const mo=document.createElement("div");mo.id="v0-motes-container";mo.setAttribute("aria-hidden","true");mo.style.cssText="pointer-events:none;position:absolute;inset:0;overflow:hidden;";m.appendChild(mo);
    const f=document.createElement("div");f.className="anim-flicker";f.setAttribute("aria-hidden","true");f.style.cssText="position:absolute;inset:0;background:rgba(0,255,255,0.05);animation:flicker 6s steps(1) infinite;mix-blend-mode:overlay;pointer-events:none;";m.appendChild(f);
    const v=document.createElement("div");v.setAttribute("aria-hidden","true");v.style.cssText="position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 35%,transparent 45%,rgba(0,0,0,0.55) 100%),linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.15) 35%,transparent 60%);pointer-events:none;";m.appendChild(v);
    const t=document.createElement("div");t.setAttribute("aria-hidden","true");t.style.cssText="position:absolute;inset-x:0;top:0;height:6vh;background:#000;";m.appendChild(t);
    const b=document.createElement("div");b.setAttribute("aria-hidden","true");b.style.cssText="position:absolute;inset-x:0;bottom:0;height:6vh;background:#000;";m.appendChild(b);
    const u=document.createElement("div");u.style.cssText="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:16vh;";
    const tb=document.createElement("div");tb.style.cssText="animation:fadeup 1.2s ease-out both;animation-delay:0.2s;text-align:center;";
    const sp=document.createElement("p");sp.style.cssText="margin-bottom:12px;font-size:12px;letter-spacing:0.5em;text-transform:uppercase;color:rgba(170,230,255,0.7);";sp.textContent="A Visual Novel";tb.appendChild(sp);
    const ti=document.createElement("h1");ti.className="anim-titleglow";ti.style.cssText="font-family:Georgia,serif;font-size:clamp(2rem,7vw,5rem);font-weight:700;letter-spacing:0.15em;color:#fff;margin:0;animation:titleglow 4s ease-in-out infinite;text-shadow:0 0 12px rgba(120,190,255,0.35),0 0 30px rgba(90,150,255,0.25),0 2px 6px rgba(0,0,0,0.6);";ti.textContent="After Class";tb.appendChild(ti);u.appendChild(tb);
    const bt=document.createElement("button");bt.type="button";bt.id="v0-press-start-btn";bt.className="anim-press";bt.style.cssText="margin-top:40px;cursor:pointer;font-size:clamp(12px,2vw,16px);font-weight:500;letter-spacing:0.4em;text-transform:uppercase;color:rgba(255,255,255,0.9);background:none;border:none;outline:none;padding:8px 24px;animation:presspulse 1.6s ease-in-out infinite;animation-delay:1s;";bt.textContent="Press Start";u.appendChild(bt);
    const h=document.createElement("p");h.style.cssText="margin-top:16px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.4);";h.textContent="Click anywhere · Enter · Space";u.appendChild(h);
const warn=document.createElement("p");warn.style.cssText="margin-top:8px;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(200,50,50,0.5);";warn.textContent="Do not play alone.";u.appendChild(warn);
    // Credits
    const cr=document.createElement("p");cr.style.cssText="margin-top:24px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.35);";cr.textContent="Credits · Bryan Lee";u.appendChild(cr);
    // Visible hint for accessing the archive
    const guide = document.createElement("p");
    guide.style.cssText = "margin-top:12px;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(120,60,60,0.4);text-align:center;";
    guide.textContent = "Press F12 for console · Right-click > Inspect for developer tools";
    u.appendChild(guide);
    // Tiny almost-invisible hint
const subtleHint = document.createElement("p");
subtleHint.style.cssText = "position:absolute;bottom:4px;right:8px;font-size:7px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(120,60,60,0.15);pointer-events:none;user-select:none;";
subtleHint.textContent = "Press F12 to edit saves in Local Storage";
m.appendChild(subtleHint);
    
    m.appendChild(u);
    this._f=document.createElement("div");this._f.className="v0-loading-screen";this._f.style.cssText="position:absolute;inset:0;z-index:10;display:none;align-items:center;justify-content:center;background:linear-gradient(rgba(8,10,16,0.62),rgba(8,10,16,0.78)),url('assets/images/backgrounds/old research builkding.jpeg') center/cover no-repeat;backdrop-filter:blur(2px);animation:fadeup 0.4s ease-out both;";
    const ft=document.createElement("p");ft.style.cssText="font-family:Georgia,serif;font-size:clamp(1.5rem,4vw,2.5rem);letter-spacing:0.1em;color:#fff;";ft.textContent="Loading...";this._f.appendChild(ft);m.appendChild(this._f);
    while(this.sceneLayer.firstChild)this.sceneLayer.removeChild(this.sceneLayer.firstChild);this.sceneLayer.appendChild(m);this._el=m;
  }
  _m() {
    const c=document.getElementById("v0-motes-container");if(!c)return;const fr=document.createDocumentFragment();
    for(let i=0;i<MOTES_COUNT;i++){const mo=document.createElement("span");const sz=(1+Math.random()*3.5).toFixed(1);const dl=(Math.random()*12).toFixed(1);const du=(9+Math.random()*12).toFixed(1);const dr=((Math.random()-0.5)*60).toFixed(1);const op=(0.25+Math.random()*0.5).toFixed(2);mo.style.cssText="position:absolute;bottom:-10px;left:"+Math.random()*100+"%;width:"+sz+"px;height:"+sz+"px;border-radius:50%;background:rgba(255,240,200,0.8);box-shadow:0 0 6px rgba(255,240,200,0.6);animation:floatmote "+du+"s linear "+dl+"s infinite;--mote-drift:"+dr+"px;--mote-opacity:"+op+";filter:blur(0.5px);";fr.appendChild(mo);}
    c.appendChild(fr);
  }
  _a() { this._el.addEventListener("click",()=>this._h());window.addEventListener("keydown",this._boundKeyHandler); }
  _k(e) { if(e.key==="Enter"||e.key===" "){e.preventDefault();this._h();} }
  _h() { if(this._started)return;this._started=true;window.removeEventListener("keydown",this._boundKeyHandler);if(this._f)this._f.style.display="none";if(this._el)this._el.remove();
    // Start music on user click (browsers require user gesture for autoplay)
    if(window.gameInstance && window.gameInstance._startBgMusic) {
      window.gameInstance._startBgMusic();
    }
    this.eventBus.emit("menu:action",{action:"new_game"}); }
  exit() { window.removeEventListener("keydown",this._boundKeyHandler);super.exit(); }
}
export default V0StartMenuScene;
