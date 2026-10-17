// Read-only local configuration check. Never contacts Cloudflare or reads secrets.
import assert from 'node:assert/strict';
import {readFile, readdir, access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import ts from 'typescript';

const root = fileURLToPath(new URL('..', import.meta.url));
const expectedOrigin = 'https://venezuelaagro-staging.alvarojuniorcarrerovasquez.workers.dev';
async function config(relative) {
  const {config, error} = ts.parseConfigFileTextToJson(relative, await readFile(path.join(root, relative), 'utf8'));
  assert.ok(!error, `${relative}: JSON/JSONC inválido`);
  return config;
}
function checkTarget(c, label) {
  assert.equal(c.name, 'venezuelaagro-staging', `${label}: Worker incorrecto`);
  assert.equal(c.account_id, '5ce31d22b086645c67dab913699edd3f', `${label}: cuenta incorrecta`);
  assert.equal(c.keep_vars, true, `${label}: keep_vars debe conservarse`);
  assert.equal(c.workers_dev, true, `${label}: workers.dev esperado`);
  assert.equal(c.assets?.run_worker_first, true, `${label}: los assets también deben pasar por la autenticación`);
  assert.equal(c.assets?.binding, 'ASSETS', `${label}: binding de assets incorrecto`);
  assert.equal(c.vars?.AUTH_MODE, 'google', `${label}: AUTH_MODE incorrecto`);
  assert.equal(c.vars?.APP_ORIGIN, expectedOrigin, `${label}: origen incorrecto`);
  assert.equal(c.vars?.TURNSTILE_SITE_KEY, '0x4AAAAAAFWfwMwzdORVkoDe', `${label}: sitekey incorrecta`);
  assert.equal(c.d1_databases?.length, 1, `${label}: se espera una sola D1`);
  assert.equal(c.d1_databases[0].binding, 'DB');
  assert.equal(c.d1_databases[0].database_name, 'venezuelaagro-staging');
  assert.equal(c.d1_databases[0].database_id, '95ad0e14-ad7f-4385-bb4e-a869197d30c7');
  assert.equal(c.r2_buckets?.length, 1, `${label}: se espera un solo R2`);
  assert.equal(c.r2_buckets[0].binding, 'BUCKET');
  assert.equal(c.r2_buckets[0].bucket_name, 'venezuelaagro-staging-files');
  for (const key of ['GOOGLE_CLIENT_SECRET', 'AUTH_SESSION_SECRET', 'TURNSTILE_SECRET_KEY']) {
    assert.ok(!Object.hasOwn(c.vars ?? {}, key), `${label}: no guardar secretos en vars`);
  }
}

try {
  const source = await config('wrangler.staging.jsonc');
  const built = await config('dist/server/wrangler.json');
  checkTarget(source, 'fuente');
  checkTarget(built, 'build');
  assert.equal(source.d1_databases[0].migrations_dir, 'drizzle');
  const migrations = (await readdir(path.join(root, 'drizzle'))).filter(name => name.endsWith('.sql')).sort();
  const journal = JSON.parse(await readFile(path.join(root, 'drizzle/meta/_journal.json'), 'utf8'));
  assert.equal(migrations.length, 10, 'Se esperan las diez migraciones 0000–0009');
  assert.deepEqual(migrations, journal.entries.map(entry => `${entry.tag}.sql`));
  migrations.forEach((name, index) => assert.ok(name.startsWith(`${String(index).padStart(4, '0')}_`)));
  const workerPath=path.resolve(root, 'dist/server', built.main);
  await access(workerPath);
  const worker=await readFile(workerPath,'utf8');
  assert.match(worker,/function deploymentTarget\(\)\s*\{\s*return "standalone";\s*\}/,'El Worker compilado no tiene la frontera standalone');
  assert.match(worker,/function isStandaloneAuth\(\)\s*\{\s*return true;\s*\}/,'La UI compilada no selecciona standalone');
  await access(path.resolve(root, 'dist/server', built.assets.directory));
  console.log('OK local: destino staging, DB/R2, keep_vars, origen, sitekey, archivos del build y migraciones 0000–0009.');
  console.log('No verifica antigüedad/integridad del build, secretos remotos, historial D1, privacidad R2 ni login real. No despliega.');
} catch (error) {
  console.error(`No continuar: ${error.message}`);
  process.exitCode = 1;
}
