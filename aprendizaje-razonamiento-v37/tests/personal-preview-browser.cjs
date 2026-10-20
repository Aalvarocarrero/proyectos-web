const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4186';
const evidenceDir = 'docs/evidence-v35';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  const errors = [];
  const checks = [];
  const check = (condition, message) => {
    assert.ok(condition, message);
    checks.push(message);
  };

  try {
    fs.mkdirSync(evidenceDir, { recursive: true });
    for (const width of [320, 375, 768, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        hasTouch: true,
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(baseUrl);
      await page.locator('#dashboard-band').waitFor();
      const savedBefore = await page.evaluate(
        () => localStorage.getItem('education-facilitation-guide:progress'),
      );

      await page.locator('[data-dashboard-area="Desarrollo personal"]').click();
      const card = page.locator('[data-dashboard-result="7y:original"]');
      await card.waitFor();
      const cardText = await card.innerText();
      check(cardText.includes('Una salida, varias soluciones'), 'activity title is visible');
      check(cardText.includes('Elige qué llevar con 8 fichas y explica qué priorizaste.'), 'card previews the real eight-token task');
      check(cardText.includes('9–12 años orientativos · apoyo disponible · puedes parar cuando quieras.'), 'card states guidance, accompaniment and stopping');
      check(await page.evaluate(() => localStorage.getItem('education-facilitation-guide:progress')) === savedBefore, 'opening the area does not change saved progress');
      check(await page.evaluate(() => localStorage.getItem('education-facilitation-guide:progress')) === savedBefore, 'rendering the card preview is presentation-only');
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no horizontal overflow at ${width}px`);

      if (width === 375) {
        await card.scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${evidenceDir}/personal-preview-card-375.png`, fullPage: true });
        await card.screenshot({ path: `${evidenceDir}/personal-preview-card-only-375.png` });
      }

      await card.focus();
      await page.keyboard.press('Enter');
      await page.locator('#session-title').waitFor();
      check(await page.evaluate(() => document.activeElement.id === 'session-title'), 'keyboard activation enters the activity with focus moved to its heading');
      check(await page.locator('.facilitation summary').isVisible(), 'adult support is available without opening the avatar');
      check(await page.locator('.facilitation').evaluate(element => !element.closest('#activity-companion')), 'adult guide is outside the avatar disclosure');
      check(await page.locator('#activity-companion').evaluate(element => !element.open), 'avatar disclosure remains closed by default');
      check(await page.locator('#pause-session').isVisible(), 'pause is available without opening the avatar');
      check(await page.locator('#finish-session').isVisible(), 'exit is available without opening the avatar');
      await page.locator('.facilitation summary').focus();
      await page.keyboard.press('Enter');
      check(await page.locator('.facilitation').evaluate(element => element.open), 'keyboard opens the adult guide independently');
      await page.locator('#pause-session').focus();
      await page.keyboard.press('Enter');
      await page.locator('#finish-paused').waitFor();
      check(await page.locator('#paused-catalog').isVisible(), 'pause offers an accessible route back to proposals');
      check(await page.locator('#finish-paused').isVisible(), 'the paused activity can be finished');
      check(errors.length === 0, `no page errors at ${width}px`);
      await context.close();
    }

    const report = {
      checks: checks.length,
      errors,
      viewports: [320, 375, 768, 1440],
      scope: 'Development card content before entry; task wording matches the existing eight-token outing planner; keyboard launch and focus; support without avatar; pause and exit; preview itself is presentation-only and does not write progress; responsive overflow.',
    };
    fs.writeFileSync(`${evidenceDir}/personal-preview-browser.json`, JSON.stringify(report, null, 2));
    console.log(report);
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
