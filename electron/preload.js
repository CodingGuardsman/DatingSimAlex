/**
 * The only bridge between the game page and the desktop. Exposed as window.native.
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("native", {
  info: () => ipcRenderer.invoke("info"),
  writeFile: (name, text) => ipcRenderer.invoke("file:write", name, text),
  writeImage: (name, dataUrl) => ipcRenderer.invoke("file:writeImage", name, dataUrl),
  readFile: name => ipcRenderer.invoke("file:read", name),
  exists: name => ipcRenderer.invoke("file:exists", name),
  reveal: name => ipcRenderer.invoke("file:reveal", name),
  shake: (ms, strength) => ipcRenderer.invoke("win:shake", ms, strength),
  jolt: (dx, dy) => ipcRenderer.invoke("win:jolt", dx, dy),
  flash: () => ipcRenderer.invoke("win:flash"),
  progress: v => ipcRenderer.invoke("win:progress", v),
  fullscreen: on => ipcRenderer.invoke("win:fullscreen", on),
  focused: () => ipcRenderer.invoke("win:focused"),
  notify: (title, body) => ipcRenderer.invoke("notify", title, body),
  guardClose: msg => ipcRenderer.invoke("close:guard", msg),
  quit: () => ipcRenderer.invoke("quit"),
  onCloseAttempt: cb => ipcRenderer.on("close-attempt", (e, msg) => cb(msg)),
  onFocusChange: cb => ipcRenderer.on("focus-change", (e, focused) => cb(focused))
});
