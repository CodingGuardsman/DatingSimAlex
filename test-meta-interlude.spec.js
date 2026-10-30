const { test, expect } = require('@playwright/test');

test('Live test: Meta interlude - glowing red background for entire scene', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:8080/');
  await page.waitForSelector('#game-container', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  await page.evaluate(() => localStorage.clear());
  
  // Start the game normally - directly start meta_interlude to test
  await page.click('.v0-start-main', { force: true });
  await page.waitForTimeout(3000);
  
  // Directly start meta_interlude to test the meta background
  await page.evaluate(() => {
    if (window.gameInstance && window.gameInstance.dialogueSystem) {
      window.gameInstance.dialogueSystem.startDialogue('meta_interlude');
    }
  });
  await page.waitForTimeout(3000);
  
  // Check the main background image element
  const bgImageCheck = await page.evaluate(() => {
    const bgImg = document.getElementById('background-image');
    if (bgImg) {
      return {
        found: true,
        src: bgImg.src,
        alt: bgImg.alt,
      };
    }
    return { found: false };
  });
  console.log('Meta interlude background:', bgImageCheck);
  
  // Check dialogue state
  const state = await page.evaluate(() => {
    return {
      gamePhase: window.gameInstance?.gamePhase,
      currentDialogueId: window.gameInstance?.dialogueSystem?.currentDialogueId,
      currentNodeId: window.gameInstance?.dialogueSystem?.currentNodeId,
    };
  });
  console.log('Dialogue state:', state);
  
  // Advance through dialogue and check background persists for ENTIRE scene (3 nodes)
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      if (window.gameInstance && window.gameInstance.dialogueSystem) {
        window.gameInstance.dialogueSystem.advance();
      }
    });
    await page.waitForTimeout(2000);
    
    const check = await page.evaluate(() => {
      const bgImg = document.getElementById('background-image');
      if (bgImg) {
        return {
          src: bgImg.src,
          alt: bgImg.alt,
        };
      }
      return { found: false };
    });
    console.log(`Node ${i+2} background:`, check);
  }
  
  // Keep browser open for observation
  await page.waitForTimeout(5000);
});