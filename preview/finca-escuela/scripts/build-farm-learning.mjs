import { transform } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
export async function buildLearningDocument() {
  const template = await readFile(new URL('learning/farm-learning.template.html', root), 'utf8');
  const engine = (await readFile(new URL('lib/farm-learning-engine.mjs', root), 'utf8')).replace(/^export /gm, '');
  const ui = (await readFile(new URL('learning/farm-learning-sessions.js', root), 'utf8')) + '\n' + (await readFile(new URL('learning/farm-learning-depth.js', root), 'utf8')) + '\n' + (await readFile(new URL('learning/farm-learning-species.js', root), 'utf8')) + '\n' + (await readFile(new URL('learning/farm-learning-challenges.js', root), 'utf8')) + '\n' + (await readFile(new URL('learning/farm-learning-ui.js', root), 'utf8'));
  // Omit standalone development comments from the offline artifact; keep readable source files.
  const compact = source => source.replace(/^[ \t]*\/\/[^\n]*\n/gm, '');
  const packed = await transform(compact(engine) + '\n' + compact(ui), {loader:'js', charset:'utf8', minifyWhitespace:true, minifyIdentifiers:true, minifySyntax:true, target:'es2020', legalComments:'none'});
  return template.replace('/* INLINE_ENGINE */', '').replace('/* INLINE_UI */', packed.code);
}
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const html = await buildLearningDocument();
  await writeFile(new URL('public/learning/finca-escuela.html', root), html);
  console.log(`Finca Escuela: ${Buffer.byteLength(html)} bytes; self-contained offline HTML.`);
}
