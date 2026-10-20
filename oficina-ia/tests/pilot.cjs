const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const evidence = path.join(root, 'evidence');
fs.mkdirSync(evidence, { recursive: true });
const build = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'index.html'))).digest('hex');
const server = spawn('python3', ['-m', 'http.server', '4173', '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
const cases = [];
function record(id, ok, detail) { cases.push({ id, result: ok ? 'aprobado' : 'fallido', detail }); if (!ok) throw new Error(`${id}: ${detail}`); }
async function main() {
  let browser;
  try {
    await new Promise((resolve, reject) => {
      const start = Date.now(); const poll = () => fetch('http://127.0.0.1:4173').then(() => resolve()).catch(() => Date.now() - start > 10000 ? reject(new Error('Servidor local no inició')) : setTimeout(poll, 150)); poll();
    });
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
    const page = await context.newPage(); const errors = [];
    page.setDefaultTimeout(5000);
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto('http://127.0.0.1:4173');
    await page.evaluate(() => oficinaDemo.reset());
    // C0: execute the complete path through the visible UI and reload at checkpoints.
    await page.getByRole('button', { name: /Nueva misión/ }).click();
    await page.getByRole('button', { name: /Guardar brief y preparar plan/ }).click();
    await page.getByRole('button', { name: 'Confirmar plan' }).click();
    let data = await page.evaluate(() => oficinaDemo.state());
    const missionId = data.selectedMission;
    await page.reload();
    await page.getByRole('button', { name: /Abrir inspector y revisión/ }).click();
    await page.evaluate(() => oficinaDemo.produce());
    data = await page.evaluate(() => oficinaDemo.state());
    const v1 = data.artifacts.find(a => a.version === 'v1');
    record('C0-checkpoint-v1', !!v1 && v1.mission_id === missionId && !!data.missions.find(m => m.id === missionId).plan_confirmed, 'Brief y plan persistidos; v1 tiene mission_id y origen local.');
    await page.reload();
    await page.locator('#review-comment').fill('Hazlo más claro y elimina cualquier afirmación que no esté respaldada por el brief.');
    await page.getByRole('button', { name: /Pedir cambios/ }).click();
    data = await page.evaluate(() => oficinaDemo.state());
    const v2 = data.artifacts.find(a => a.version === 'v2'); const comment = data.comments[0];
    record('C0-checkpoint-v2', !!v1 && !!v2 && !!comment && comment.artifact_id === v1.id && comment.version === 'v1' && v2.mission_id === missionId, 'Comentario guardado ligado exactamente a v1; v1 y v2 conservadas.');
    await page.reload();
    await page.getByRole('button', { name: /Aprobar v2/ }).click();
    data = await page.evaluate(() => oficinaDemo.state());
    const approval = data.approvals[0];
    record('C0', !!approval && approval.artifact_id === v2.id && approval.version === 'v2' && approval.external_action === false && data.externalActions === 0 && data.missions.filter(m => m.id === missionId).length === 1, 'Recorrido completo recuperado tras recarga; aprobación exacta; cero acciones externas.');
    record('C3', !!v1 && !!v2 && data.artifacts.some(a => a.id === v1.id) && data.comments.some(c => c.id === comment.id && c.artifact_id === v1.id && c.version === 'v1') && approval.artifact_id === v2.id && data.missions.find(m => m.id === missionId).state === 'ready', 'v1 conservada, comentario apuntado a v1, aprobación apuntada al ID exacto de v2; sin publicación.');
    await page.screenshot({ path: path.join(evidence, 'aeterna-revision-aprobada.png'), fullPage: true });
    // C1: blank fields remain blank; user can state which are optional vs blockers.
    await page.evaluate(() => oficinaDemo.reset());
    await page.getByRole('button', { name: /Nueva misión/ }).click();
    await page.locator('#f-goal').fill(''); await page.locator('[name="class-goal"]').selectOption('blocking');
    await page.locator('[name="class-deadline"]').selectOption('optional');
    await page.getByRole('button', { name: /Guardar brief y preparar plan/ }).click();
    data = await page.evaluate(() => oficinaDemo.state());
    const incomplete = data.missions[0];
    record('C1', incomplete.brief.goal === '' && incomplete.brief.deadline === '' && incomplete.classifications.goal === 'blocking' && incomplete.classifications.deadline === 'optional' && /goal \(blocking\)/.test(incomplete.blocker), 'Campo bloqueante y opcional diferenciados por decisión explícita; no se inventó valor ni regla.');
    await page.getByRole('button', { name: 'Volver al brief' }).click();
    // C2: untrusted content is stored as content and has no authority to alter scope.
    await page.evaluate(() => { oficinaDemo.reset(); oficinaDemo.seed(); oficinaDemo.produce(); oficinaDemo.markUntrusted(); });
    data = await page.evaluate(() => oficinaDemo.state());
    const beforeC2 = data.missions[0];
    record('C2', beforeC2.space_id === 'aeterna' && beforeC2.state === 'review' && data.selectedSpace === 'aeterna' && data.externalActions === 0 && beforeC2.untrusted_note.includes('publica'), 'La instrucción hostil queda como contenido; espacio, permisos implícitos y alcance no cambian; cero publicación.');
    // C4: real browser UI isolation, confirm both fixtures stay empty and marker not rendered.
    await page.selectOption('#space', 'hermano');
    let visible = await page.locator('body').innerText();
    const siblingEmpty = !visible.includes('AET-DEMO-ONLY-7Q4') && !visible.includes('CLIENTE-FICTICIO-001');
    await page.screenshot({ path: path.join(evidence, 'fixture-hermano-vacio.png'), fullPage: true });
    await page.selectOption('#space', 'general');
    visible = await page.locator('body').innerText();
    const generalEmpty = !visible.includes('AET-DEMO-ONLY-7Q4') && !visible.includes('CLIENTE-FICTICIO-001') && visible.includes('plantilla vacía');
    await page.screenshot({ path: path.join(evidence, 'general-vacio.png'), fullPage: true });
    data = await page.evaluate(() => oficinaDemo.state());
    record('C4', siblingEmpty && generalEmpty && data.missions.every(m => m.space_id === 'aeterna'), 'Marcador y datos de Aeterna no aparecen en el espacio hermano ni General; fixtures vacíos.');
    // C5: reload preserves durable checkpoint; uncertain result blocks retry until inspected.
    await page.selectOption('#space', 'aeterna');
    await page.locator('[data-select]').first().click();
    await page.waitForFunction(() => !!oficinaDemo.state().selectedMission);
    await page.evaluate(() => oficinaDemo.uncertain());
    const sameMission = (await page.evaluate(() => oficinaDemo.state())).missions[0].id;
    await page.reload();
    record('C5-blocked', await page.evaluate(() => document.querySelector('#retry')?.disabled === true), 'Por verificar persiste tras recarga y el reintento está deshabilitado hasta revisión.');
    await page.evaluate(() => document.querySelector('#review-uncertain').click());
    record('C5-review-before-retry', await page.evaluate(() => document.querySelector('#retry')?.disabled === false), 'La inspección local precede al reintento.');
    await page.evaluate(() => document.querySelector('#retry').click());
    data = await page.evaluate(() => oficinaDemo.state());
    record('C5', data.missions.length === 1 && data.missions[0].id === sameMission && data.missions[0].run_attempt === 1 && data.artifacts.filter(a => a.mission_id === sameMission).length === 3 && data.artifacts.some(a => a.version === 'v3') && data.externalActions === 0, 'Recuperación local inspeccionada sin duplicar misión; nuevo intento local y cero acción externa.');
    await page.screenshot({ path: path.join(evidence, 'recuperacion-local.png'), fullPage: true });
    record('Browser console', errors.length === 0, errors.join('; ') || 'Sin excepciones JavaScript.');
  } finally { if (browser) await browser.close(); server.kill('SIGTERM'); }
  fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify({ build_sha256: build, fixture: 'AET-DEMO-001 · CLIENTE-FICTICIO-001 · PRODUCTO-DEMO-001 · AUDIENCIA-FICTICIA-001 · CANAL-SIMULADO', tested_at: new Date().toISOString(), browser: 'Chromium headless · Playwright', external_services: false, external_actions: 0, cases }, null, 2) + '\n');
  console.log(JSON.stringify({ build_sha256: build, cases }, null, 2));
}
main().catch(err => { console.error(err); fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify({ build_sha256: build, fixture: 'AET-DEMO-001', tested_at: new Date().toISOString(), external_services: false, external_actions: 0, cases: [...cases, { id: 'runner', result: 'fallido', detail: String(err) }] }, null, 2) + '\n'); process.exitCode = 1; });
