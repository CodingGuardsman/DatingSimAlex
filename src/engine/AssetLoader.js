/**
 * AssetLoader.js — Loads images and JSON data, provides placeholder fallbacks
 */
export class AssetLoader {
  constructor() {
    this.cache = new Map();
    this.imageCache = new Map();
    this.loadPromises = new Map();
    this.failedAssets = new Set();
  }

  async loadJSON(url) {
    if (this.cache.has(url)) return this.cache.get(url);
    if (this.loadPromises.has(url)) return this.loadPromises.get(url);
    
    const promise = fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
        return res.json();
      })
      .then(data => {
        this.cache.set(url, data);
        return data;
      })
      .catch(err => {
        console.warn(`Failed to load JSON: ${url}`, err);
        this.failedAssets.add(url);
        return {};
      });

    this.loadPromises.set(url, promise);
    return promise;
  }

  loadImage(src) {
    if (this.imageCache.has(src)) return this.imageCache.get(src);
    if (this.loadPromises.has(src)) return this.loadPromises.get(src);

    const img = new Image();
    img.src = src;
    
    const promise = new Promise((resolve, reject) => {
      img.onload = () => { this.imageCache.set(src, img); resolve(img); };
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}, using placeholder`);
        this.failedAssets.add(src);
        this.imageCache.set(src, null);
        resolve(null);
      };
    });

    this.loadPromises.set(src, promise);
    return promise;
  }

  /**
   * Generate a colored placeholder div element with a label.
   * Used when actual art isn't available yet.
   */
  createPlaceholderElement(label, bgColor = "#555", textColor = "#aaa", width = "100%", height = "200px") {
    const div = document.createElement("div");
    div.className = "placeholder-asset";
    div.style.backgroundColor = bgColor;
    div.style.color = textColor;
    div.style.width = width;
    div.style.height = height;
    div.style.fontSize = "1rem";
    div.textContent = label;
    return div;
  }

  /**
   * Resolve an image source, returning a placeholder element if loading fails.
   */
  async resolveImage(src, placeholderLabel, options = {}) {
    const img = await this.loadImage(src);
    if (img) {
      const imgEl = document.createElement("img");
      imgEl.src = src;
      imgEl.alt = placeholderLabel;
      Object.assign(imgEl.style, options.style || {});
      return imgEl;
    }
    return this.createPlaceholderElement(placeholderLabel, options.bgColor, options.textColor, options.width, options.height);
  }

  /**
   * Preload an array of image URLs.
   */
  async preloadImages(urls) {
    const promises = urls.map(url => this.loadImage(url));
    await Promise.allSettled(promises);
    return true;
  }

  /**
   * Preload an array of JSON files.
   */
  async preloadJSON(urls) {
    const promises = urls.map(url => this.loadJSON(url));
    const results = await Promise.allSettled(promises);
    return results.map((r, i) => ({ url: urls[i], data: r.status === "fulfilled" ? r.value : {} }));
  }

  clearCache() {
    this.cache.clear();
    this.imageCache.clear();
    this.loadPromises.clear();
  }
}

export default AssetLoader;
