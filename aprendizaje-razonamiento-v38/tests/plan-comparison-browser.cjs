const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.BASE_URL || 'http://127.0.0.1:4194';
const evidence = 'docs/evidence-v36';
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const checks = [];
  const errors = [];
  const check = (condition, name) => { assert.ok(condition, name); checks.push(name); };
  try {
    fs.mkdirSync(evidence, { recursive: true });
    for (const width of [320, 390, 1024]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
      const page = await context.newPage();
      page.setDefaultTimeout(6000);
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base);
      await page.selectOption('#dashboard-band', '7y');
      await page.locator('[data-dashboard-route="7y:original"]').click();
      for (const id of ['water', 'map', 'fruit', 'notebook']) await page.locator(`input[value="${id}"]`).check();
      await page.locator('#check-plan').click();
      await page.locator('#compare-plans').click();
      check((await page.locator('.plan-comparison').innerText()).includes('Total: 5 · Saldo: 3'), `${width}px retains A`);
      await page.locator('input[value="water"]').check();
      await page.locator('input[value="map"]').check();
      await page.locator('#check-plan').click();
      check((await page.locator('#feedback').innerText()).includes('Falta resolver'), `${width}px explains incomplete B`);
      check((await page.locator('.plan-comparison').innerText()).includes('Total: 5 · Saldo: 3'), `${width}px preserves A after invalid B`);
      await page.locator('input[value="sandwich"]').check();
      await page.locator('input[value="notebook"]').check();
      await page.locator('#check-plan').focus();
      await page.keyboard.press('Enter');
      const comparison = await page.locator('.plan-comparison').innerText();
      check(comparison.includes('Total: 7 · Saldo: 1') && comparison.includes('Diferencia entre totales: 2 fichas'), `${width}px displays B, balances and difference`);
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px has no horizontal overflow`);
      check(await page.evaluate(() => document.activeElement.id === 'check-plan'), `${width}px keeps keyboard focus after review`);
      if (width === 390) await page.screenshot({ path: `${evidence}/plan-comparison-mobile.png`, fullPage: true });
      await context.close();
    }
    check(errors.length === 0, 'no browser runtime errors');
    const report = { checks, errors, viewportWidths: [320, 390, 1024], note: 'Real Chromium run; layout/focus checks do not establish full WCAG conformance or learner validation.' };
    fs.writeFileSync(`${evidence}/browser-results.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
