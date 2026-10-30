const { test, expect } = require('@playwright/test');

test('Live test: Click starts game and removes loading screen', async ({ page }) => {
  // Capture console messages
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:8080/');
  await page.waitForSelector('#game-container', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  await page.evaluate(() => localStorage.clear());
  
  // Click with force - this should trigger the V0StartMenuScene click handler
  await page.click('.v0-start-main', { force: true });
  await page.waitForTimeout(3000); // Wait for async game start
  
  // Check if game started automatically via click handler
  const gameStarted = await page.evaluate(() => {
    return typeof window.gameInstance !== 'undefined' && window.gameInstance.gamePhase === 'visual_novel';
  });
  console.log('Game phase after click:', gameStarted ? 'visual_novel' : 'not started');
  
  // Check if start menu elements are removed
  const afterClick = await page.evaluate(() => {
    const selectors = ['.v0-start-main','.v0-loading-screen','.anim-ambient','.anim-kenburns','.anim-rays','.anim-flicker','#v0-motes-container'];
    const found = [];
    selectors.forEach(sel => { 
      const els = document.querySelectorAll(sel); 
      if (els.length > 0) {
        els.forEach(el => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          found.push({ 
            selector: sel, 
            visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0',
            inSceneLayer: el.closest('#scene-layer') !== null
          });
        });
      }
    });
    return found;
  });
  console.log('After click:', afterClick);
  
  // Check scene layer
  const sceneLayer = await page.evaluate(() => {
    const layer = document.getElementById('scene-layer');
    return { 
      innerHTML: layer.innerHTML.substring(0, 300),
      children: layer.children.length
    };
  });
  console.log('Scene layer:', sceneLayer);
  
  // Check for any remaining loading screen backgrounds on VISIBLE elements
  const elementsWithBackgrounds = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const found = [];
    all.forEach(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const visible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      if (visible && style.backgroundImage && style.backgroundImage !== 'none') {
        if (style.backgroundImage.includes('old research builkding') || style.backgroundImage.includes('classroom-hero')) {
          found.push({ tag: el.tagName, class: el.className, id: el.id, backgroundImage: style.backgroundImage });
        }
      }
    });
    return found;
  });
  console.log('Visible elements with loading screen backgrounds:', elementsWithBackgrounds);
  
  expect(gameStarted).toBe(true);
  expect(afterClick.every(e => !e.visible)).toBe(true);
  expect(elementsWithBackgrounds.length).toBe(0);
  console.log('✅ Game started, start menu removed, no loading screen backgrounds');
  
  // Keep browser open for 10 seconds so you can see it
  await page.waitForTimeout(10000);
});