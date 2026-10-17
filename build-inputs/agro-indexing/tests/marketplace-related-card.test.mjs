import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({appType:'custom', configFile:false, root, resolve:{alias:{'@':root}}, server:{middlewareMode:true, hmr:false, watch:null}});
after(() => vite.close());
const {MarketplaceRelatedCard} = await vite.ssrLoadModule('/components/marketplace-related-card.tsx');
const {demoMarketplaceListings} = await vite.ssrLoadModule('/lib/marketplace-demo.ts');
const {marketplacePath} = await vite.ssrLoadModule('/lib/marketplace-details.ts');
const markup = listing => renderToStaticMarkup(React.createElement(MarketplaceRelatedCard, {listing}));

function descendants(element) {
  if (!React.isValidElement(element)) return [];
  return [element, ...React.Children.toArray(element.props.children).flatMap(descendants)];
}

test('gallery cards retain full title, seller and location and have a consistent bottom action', () => {
  for (const listing of demoMarketplaceListings) {
    const html = markup(listing);
    const tree = MarketplaceRelatedCard({listing});
    const nodes = descendants(tree);
    assert.match(html, /flex h-full min-w-0 flex-col/);
    assert.match(html, /aspect-\[16\/10\] shrink-0/);
    assert.match(html, /flex flex-1 flex-col/);
    assert.match(html, /mt-auto pt-5/);
    assert.match(html, /button-light w-full/);
    assert.equal(nodes.find(node => node.type === 'h3').props.children, listing.title);
    assert.ok(nodes.some(node => node.type === 'span' && node.props.children === listing.sellerName));
    assert.ok(nodes.some(node => node.type === 'span' && node.props.children === listing.location));
    assert.doesNotMatch(html, /line-clamp|truncate/);
    assert.match(html, /focus-visible:outline/);
  }
});

test('modal action selects the exact listing and has a unique accessible name', () => {
  const listing = demoMarketplaceListings[0];
  let selected;
  const nodes = descendants(MarketplaceRelatedCard({listing, onSelect: row => { selected = row; }}));
  const button = nodes.find(node => node.type === 'button');
  assert.equal(button.props.type, 'button');
  assert.equal(button.props['aria-label'], `Ver anuncio: ${listing.title}`);
  button.props.onClick();
  assert.equal(selected, listing);
  assert.equal(nodes.filter(node => node.type === 'button').length, 1);
});

test('permanent cards keep real and demo navigation, with a same-ratio no-photo fallback', () => {
  for (const listing of [demoMarketplaceListings[0], {id:'real-listing', title:'Lote real', sellerName:'Productor', location:'Lara', category:'Bovinos', description:''}]) {
    const html = markup(listing);
    assert.ok(html.includes(`href="${marketplacePath(listing)}"`));
    assert.equal(html.includes('>DEMO<'), !!listing.demo);
    if (!listing.demo) {
      assert.match(html, /Sin fotografía/);
      assert.match(html, /aspect-\[16\/10\]/);
    }
  }
});

test('image-fit and responsive integration preserve product visibility and modal behavior', async () => {
  const listing = {...demoMarketplaceListings[0], imageFit:'contain'};
  assert.match(markup(listing), /object-contain/);
  const detail = await readFile(root + 'components/marketplace-detail.tsx', 'utf8');
  assert.match(detail, /sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3/);
  assert.match(detail, /MarketplaceRelatedCard key=\{row.id\} listing=\{row\} onSelect=\{onSelect\}/);
  const browser = await readFile(root + 'components/marketplace-browser.tsx', 'utf8');
  assert.match(browser, /onSelect=\{row=>\{selectListing\(row\);document.querySelector/);
});
