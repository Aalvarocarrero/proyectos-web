import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';

const read = name => readFile(new URL('../' + name, import.meta.url), 'utf8');
const home = await read('components/home-page-content.tsx');
const css = await read('app/globals.css');
const start = home.indexOf('<section aria-labelledby="home-closing-title"');
const closing = home.slice(start, home.indexOf('</section>', start));

test('home closes with an accessible invitation and two honest, unchanged destinations', () => {
  assert.ok(start > home.indexOf('Un legado que comenzó en familia.'));
  assert.ok(start < home.indexOf('<PublicFooter'));
  assert.match(closing, /<h2 id="home-closing-title">/);
  assert.match(closing, /Somos campo\.<br \/>Somos familia\.<br \/><span>Somos futuro\./);
  assert.match(closing, /href="\/app" prefetch=\{false\} className="home-closing-primary"/);
  assert.match(closing, /href="\/nosotros#contacto" className="home-closing-secondary"/);
  assert.equal((closing.match(/<Link /g) || []).length, 2);
  assert.ok(closing.indexOf('home-closing-primary') < closing.indexOf('home-closing-secondary'));
  assert.match(closing, /<ul className="home-closing-benefits" aria-label=/);
});

test('approved Morochito is reused with intrinsic dimensions and a small lazy-load budget', async () => {
  assert.match(closing, /src="\/morochito-transparent.webp"/);
  assert.match(closing, /alt="Morochito, mascota educativa de Parcela Los Morochos"/);
  assert.match(closing, /width=\{759\} height=\{1140\}/);
  assert.match(closing, /sizes="\(max-width: 639px\) 152px, \(max-width: 899px\) 190px, 248px" loading="lazy"/);
  assert.ok((await stat(new URL('../public/morochito-transparent.webp', import.meta.url))).size < 90 * 1024);
  assert.doesNotMatch(closing, /canvas|iframe|video|fetch\(|onMouseMove|onPointerMove/);
  for (const decoration of ['grid', 'orbit-outer', 'orbit-inner', 'spark-one', 'spark-two', 'corner-start', 'corner-end']) {
    assert.match(closing, new RegExp(`home-closing-${decoration}[^>]*aria-hidden="true"`));
  }
});

test('closing layout is responsive, has clear keyboard focus and honors reduced motion', () => {
  assert.match(css, /home-closing-main \{ display: grid; grid-template-columns: minmax\(0,1.2fr\) minmax\(0,1fr\)/);
  assert.match(css, /home-closing-actions a \{[^}]*min-height: 52px/);
  assert.match(css, /home-closing a:focus-visible \{ outline: 3px solid/);
  const mobile = css.slice(css.lastIndexOf('@media (max-width: 639px)'));
  assert.match(mobile, /home-closing-main \{ grid-template-columns: minmax\(0,1fr\)/);
  assert.match(mobile, /home-closing-actions a \{[^}]*min-height: 48px/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)[\s\S]*home-closing-caption-float 4s ease-in-out 1/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*home-closing-mascot-caption \{ animation: none;/);
  assert.doesNotMatch(css.slice(css.indexOf('/* Closing invitation')), /animation:[^;]*infinite/);
});
