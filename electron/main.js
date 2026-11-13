/**
 * Electron shell for After Class.
 * Serves the game over a private app:// scheme and exposes a small native bridge (see preload.js).
 * Everything the game writes goes into one folder next to the .exe: "Hoshimi Academy".
 */
const { app, BrowserWindow, ipcMain, protocol, net, shell, Notification, screen, session } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execFile } = require("child_process");
const { pathToFileURL } = require("url");

const ROOT = path.join(__dirname, "..");

// Portable builds run from a temp folder; electron-builder tells us where the real .exe lives.
const baseDir = process.env.PORTABLE_EXECUTABLE_DIR
  || (app.isPackaged ? path.dirname(process.execPath) : path.join(ROOT, "game-files"));
const GAME_DIR = path.join(baseDir, "Hoshimi Academy");

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

let win = null;
let closeGuard = null;   // a message to show the first time the player tries to close, or null
let shaking = false;

// Priority order; only these display names can cross the native bridge.
const RUNNING_APPS = new Map([
  ["steam", "Steam"], ["epicgameslauncher", "Epic Games"],
  ["ddlc", "Doki Doki Literature Club"], ["doki doki literature club", "Doki Doki Literature Club"],
  ["robloxplayerbeta", "Roblox"], ["leagueclient", "League of Legends"],
  ["valorant", "VALORANT"], ["genshinimpact", "Genshin Impact"], ["osu!", "osu!"],
  ["discord", "Discord"], ["obs64", "OBS"], ["obs", "OBS"],
  ["spotify", "Spotify"], ["code", "Visual Studio Code"], ["blender", "Blender"],
  ["unityhub", "Unity"], ["unity", "Unity"], ["photoshop", "Photoshop"],
  ["vlc", "VLC"], ["telegram", "Telegram"], ["slack", "Slack"], ["zoom", "Zoom"]
]);
let runningAppCache = "", runningAppExpires = 0, runningAppPending = null;

function runningApp() {
  if (Date.now() < runningAppExpires) return Promise.resolve(runningAppCache);
  if (runningAppPending) return runningAppPending;
  runningAppPending = new Promise(resolve => {
    const finish = value => {
      runningAppCache = value;
      runningAppExpires = Date.now() + 60000;
      resolve(value);
    };
    const windows = process.platform === "win32";
    try {
      execFile(windows ? "tasklist" : "ps", windows ? ["/FO", "CSV", "/NH"] : ["-axco", "comm"],
        { timeout: 3000, windowsHide: true }, (err, stdout) => {
          if (err) return finish("");
          try {
            const images = new Set();
            for (const line of stdout.split(/\r?\n/)) {
              // tasklist's first CSV field is the image name; ignore all other fields.
              const first = windows ? /^"((?:[^"]|"")*)"/.exec(line) : null;
              const image = windows ? (first ? first[1].replace(/""/g, '"') : "") : path.basename(line.trim());
              images.add(image.toLowerCase().replace(/\.exe$/, ""));
            }
            for (const [image, display] of RUNNING_APPS) {
              if (images.has(image)) return finish(display);
            }
            finish("");
          } catch (e) { finish(""); }
        });
    } catch (e) { finish(""); }
  }).finally(() => { runningAppPending = null; });
  return runningAppPending;
}

function safeName(name) {
  // Only plain file names inside the game folder: no paths, no traversal.
  const base = path.basename(String(name || "")).replace(/[^\w.\- ]/g, "_");
  if (!base || base.startsWith(".")) throw new Error("bad file name");
  return path.join(GAME_DIR, base);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 960,
    minHeight: 560,
    title: "After Class",
    backgroundColor: "#07060a",
    icon: path.join(ROOT, "assets", "icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.removeMenu();
  win.loadURL("app://game/index.html");

  win.on("close", e => {
    if (closeGuard) {
      e.preventDefault();
      const msg = closeGuard;
      closeGuard = null; // only once: the second close always works
      win.webContents.send("close-attempt", msg);
    }
  });
  win.on("blur", () => win && win.webContents.send("focus-change", false));
  win.on("focus", () => win && win.webContents.send("focus-change", true));
  win.on("minimize", () => win && win.webContents.send("focus-change", false));
  win.on("restore", () => win && win.webContents.send("focus-change", true));
}

app.setAppUserModelId("com.afterclass.game");

app.whenReady().then(() => {
  protocol.handle("app", req => {
    const { pathname } = new URL(req.url);
    const file = path.normalize(path.join(ROOT, decodeURIComponent(pathname)));
    if (!file.startsWith(ROOT)) return new Response("forbidden", { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });

  ipcMain.handle("info", () => ({
    username: os.userInfo().username,
    platform: process.platform,
    gameDir: GAME_DIR
  }));
  ipcMain.handle("apps:running", () => runningApp());

  ipcMain.handle("file:write", (e, name, text) => {
    fs.mkdirSync(GAME_DIR, { recursive: true });
    fs.writeFileSync(safeName(name), String(text), "utf8");
    return true;
  });
  ipcMain.handle("file:writeImage", (e, name, dataUrl) => {
    fs.mkdirSync(GAME_DIR, { recursive: true });
    const b64 = String(dataUrl).replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(safeName(name), Buffer.from(b64, "base64"));
    return true;
  });
  ipcMain.handle("file:read", (e, name) => {
    try { return fs.readFileSync(safeName(name), "utf8"); } catch (err) { return null; }
  });
  ipcMain.handle("file:exists", (e, name) => fs.existsSync(safeName(name)));
  ipcMain.handle("file:reveal", (e, name) => {
    fs.mkdirSync(GAME_DIR, { recursive: true });
    if (name && fs.existsSync(safeName(name))) shell.showItemInFolder(safeName(name));
    else shell.openPath(GAME_DIR);
    return true;
  });

  ipcMain.handle("win:shake", async (e, ms = 600, strength = 12) => {
    if (!win || shaking || win.isMaximized() || win.isFullScreen()) return false;
    shaking = true;
    const [x, y] = win.getPosition();
    const end = Date.now() + ms;
    while (Date.now() < end) {
      win.setPosition(x + Math.round((Math.random() - 0.5) * strength * 2), y + Math.round((Math.random() - 0.5) * strength * 2));
      await new Promise(r => setTimeout(r, 16));
    }
    win.setPosition(x, y);
    shaking = false;
    return true;
  });
  ipcMain.handle("win:jolt", async (e, dx = 0, dy = 80) => {
    if (!win || win.isMaximized() || win.isFullScreen()) return false;
    const [x, y] = win.getPosition();
    const area = screen.getDisplayMatching(win.getBounds()).workArea;
    const nx = Math.max(area.x, Math.min(x + dx, area.x + area.width - 200));
    const ny = Math.max(area.y, Math.min(y + dy, area.y + area.height - 200));
    win.setPosition(nx, ny);
    await new Promise(r => setTimeout(r, 900));
    win.setPosition(x, y);
    return true;
  });
  // 2.2: windowed-mode entrapment. Out of fullscreen, shrunk, thrown around the desktop, pinned in a corner,
  // then put back exactly as it was. Only called from one place in the script.
  ipcMain.handle("win:entrap", async () => {
    if (!win || shaking) return false;
    shaking = true;
    const wasFull = win.isFullScreen(), wasMax = win.isMaximized();
    if (wasFull) { win.setFullScreen(false); await new Promise(r => setTimeout(r, 700)); }
    if (wasMax) { win.unmaximize(); await new Promise(r => setTimeout(r, 300)); }
    const before = win.getBounds();
    const area = screen.getDisplayMatching(before).workArea;
    const w = 640, h = 380;
    win.setMinimumSize(320, 200);
    const corners = [[area.x + area.width - w, area.y + area.height - h], [area.x, area.y], [area.x + area.width - w, area.y], [area.x, area.y + area.height - h]];
    for (const [cx, cy] of corners) {
      const end = Date.now() + 520;
      while (Date.now() < end) {
        win.setBounds({ x: cx + Math.round((Math.random() - 0.5) * 40), y: cy + Math.round((Math.random() - 0.5) * 40), width: w, height: h });
        await new Promise(r => setTimeout(r, 16));
      }
      win.setBounds({ x: cx, y: cy, width: w, height: h });
      await new Promise(r => setTimeout(r, 380));
    }
    await new Promise(r => setTimeout(r, 900));
    win.setMinimumSize(960, 560);
    win.setBounds(before);
    if (wasMax) win.maximize();
    if (wasFull) win.setFullScreen(true);
    shaking = false;
    return true;
  });
  // 2.2: a pretend crash to desktop. The window disappears, then comes back on its own and reloads.
  ipcMain.handle("win:crash", () => {
    if (!win) return false;
    closeGuard = null;
    win.hide();
    setTimeout(() => { if (!win) return; win.reload(); win.show(); win.focus(); }, 3500);
    return true;
  });
  ipcMain.handle("win:flash", () => { win && win.flashFrame(true); return true; });
  ipcMain.handle("win:progress", (e, v) => { win && win.setProgressBar(v); return true; });
  ipcMain.handle("win:fullscreen", (e, on) => { win && win.setFullScreen(!!on); return win ? win.isFullScreen() : false; });
  ipcMain.handle("win:focused", () => (win ? win.isFocused() : true));
  ipcMain.handle("notify", (e, title, body) => {
    if (Notification.isSupported()) new Notification({ title: String(title), body: String(body), silent: false }).show();
    return true;
  });
  ipcMain.handle("close:guard", (e, msg) => { closeGuard = msg || null; return true; });

  // 2.1: the game keeps an eye on the files it has written. If the player deletes one, the girls notice.
  // It only ever checks files it wrote itself, inside its own folder, and never deletes anything.
  const watched = new Set();
  ipcMain.handle("files:watch", (e, names) => {
    for (const n of names || []) { try { safeName(n); watched.add(path.basename(String(n))); } catch (err) { /* bad name */ } }
    return true;
  });
  ipcMain.handle("file:written", (e, name) => { try { safeName(name); watched.add(path.basename(String(name))); } catch (err) { /* bad name */ } return true; });
  setInterval(() => {
    if (!win || !watched.size) return;
    for (const n of [...watched]) {
      if (!fs.existsSync(safeName(n))) { watched.delete(n); win.webContents.send("file-gone", n); }
    }
  }, 1500);

  // Camera and microphone requests come only from scenes the player agreed to (see senses.js). Nothing else is allowed.
  session.defaultSession.setPermissionRequestHandler((wc, permission, cb) => cb(permission === "media"));
  session.defaultSession.setPermissionCheckHandler((wc, permission) => permission === "media");
  ipcMain.handle("quit", () => { closeGuard = null; app.quit(); });

  createWindow();
});

app.on("window-all-closed", () => app.quit());
