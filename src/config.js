/**
 * config.js — Release settings.
 *
 * The web version (GitHub Pages) is a free demo: Act 1 only.
 * The desktop .exe is always the full game. Add ?full to the web URL to test the full game in a browser.
 */
export const STORE_URL = "https://YOUR-USERNAME.itch.io/after-class";

export const STORE_READY = !STORE_URL.includes("YOUR-USERNAME");

export const IS_DEMO = !window.native && !new URLSearchParams(location.search).has("full");
