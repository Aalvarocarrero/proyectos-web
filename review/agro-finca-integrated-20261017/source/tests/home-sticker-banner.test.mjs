import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({ appType: 'custom', configFile: false, root, resolve: { alias: { '@': root } }, server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
after(() => vite.close());
const { HomeStickerBanner } = await vite.ssrLoadModule('/components/home-sticker-banner.tsx');
const nodes = n => !n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...nodes(n.props?.children)];

test('homepage banner has a real gallery CTA, named landmark and keyboard focus treatment', async () => {
  const tree = HomeStickerBanner();
  assert.equal(tree.type, 'aside');
  const all = nodes(tree);
  assert.ok(all.some(n => n.type === 'h2' && n.props.id === tree.props['aria-labelledby']));
  const links = all.filter(n => n.props?.href);
  assert.equal(links.length, 1);
  assert.equal(links[0].props.href, '/stickers');
  assert.equal(links[0].props.prefetch, false);
  assert.match(links[0].props.className, /min-h-12/);
  assert.match(links[0].props.className, /focus-visible:outline/);
  assert.ok((await stat(root + 'app/stickers/page.tsx')).isFile());
});

test('banner reuses just three small lazy thumbnails with intrinsic dimensions', async () => {
  const images = nodes(HomeStickerBanner()).filter(n => n.props?.src);
  assert.equal(images.length, 3);
  let bytes = 0;
  for (const image of images) {
    assert.match(image.props.src, /^\/sticker-packs\/thumbs\/.+\.webp$/);
    assert.equal(image.props.loading, 'lazy');
    assert.equal(image.props.alt, '');
    assert.ok(image.props.width > 0 && image.props.height > 0);
    bytes += (await stat(root + 'public' + image.props.src)).size;
  }
  assert.ok(bytes < 70 * 1024, `Thumbnail budget exceeded: ${bytes}`);
  const source = await readFile(root + 'components/home-sticker-banner.tsx', 'utf8');
  assert.doesNotMatch(source, /use client|useEffect|setInterval|fetch\(|\.download\.src/);
});

test('banner follows Mi Finca and its onboarding steps without displacing the hero', async () => {
  const home = await readFile(root + 'components/home-page-content.tsx', 'utf8');
  const order = ['aria-labelledby="home-title"', 'id="mi-finca"', '<SectionGuide ', '<HomeStickerBanner />', 'aria-labelledby="home-routes-title"'];
  const positions = order.map(marker => home.indexOf(marker));
  assert.ok(positions.every(p => p >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});
