import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import postcss from 'postcss';

const css = await readFile(new URL('../app/globals.css', import.meta.url), 'utf8');
const sheet = postcss.parse(css);
const rules = [];
sheet.walkRules(rule => rules.push(rule));
const value = (rule, property) => rule.nodes.find(node => node.prop === property)?.value;
const family = rules.find(rule => rule.selector === '.glass-action-orb');

test('clear floating glass has a neutral six-percent surface, quiet hover and bounded static blur', () => {
  assert.match(css, /--agro-glass-bg:rgba\(255,255,255,\.06\)/);
  assert.match(css, /--agro-glass-blur:8px/);
  assert.equal(value(family, 'background'), 'var(--agro-glass-bg)');
  assert.equal(value(family, 'backdrop-filter'), 'blur(var(--agro-glass-blur)) saturate(105%)');
  assert.equal(value(family, '-webkit-backdrop-filter'), value(family, 'backdrop-filter'));
  const hover = rules.find(rule => rule.selector === '.glass-action-orb:hover, .glass-action-orb:active');
  assert.equal(value(hover, 'background'), 'rgba(255,255,255,.14)');
  const mobile = rules.find(rule => rule.selector === '.glass-action-orb' && rule.parent.params?.includes('pointer:coarse'));
  assert.equal(value(mobile, '--agro-glass-blur'), '6px');
  assert.equal(value(family, 'will-change'), undefined);
});

test('local text and icon backing retain AA contrast even over pure black', () => {
  const foreground = [24, 37, 30]; // #18251e
  const darkestBacking = [255, 255, 255].map(channel => channel * .82);
  const luminance = rgb => rgb.map(channel => {
    const s = channel / 255;
    return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
  }).reduce((sum, channel, i) => sum + channel * [.2126, .7152, .0722][i], 0);
  const contrast = (luminance(darkestBacking) + .05) / (luminance(foreground) + .05);
  assert.ok(contrast >= 4.5);
  assert.equal(value(family, 'color'), '#18251e');
  for (const selector of ['.glass-action-orb > svg', '.glass-action-orb > span']) {
    assert.equal(value(rules.find(rule => rule.selector === selector), 'background'), 'rgba(255,255,255,.82)');
  }
});

test('accessibility and unsupported-blur fallbacks stay opaque even during hover or press', () => {
  for (const preference of ['prefers-reduced-transparency:reduce', 'forced-colors:active', 'backdrop-filter:blur(1px)']) {
    const fallback = rules.find(rule => rule.parent.params?.includes(preference) && rule.selector.includes('.glass-action-orb:hover'));
    assert.ok(fallback, preference);
    assert.ok(fallback.selector.includes('.glass-action-orb:active'));
    assert.ok(['#f4edde', 'ButtonFace'].includes(value(fallback, 'background')));
  }
  const focus = rules.find(rule => rule.selector === '.glass-action-orb:focus-visible');
  assert.equal(value(focus, 'outline'), '3px solid #18251e');
  assert.match(value(focus, 'box-shadow'), /#fff/);
  assert.match(css, /prefers-reduced-motion:reduce\) \{ \.glass-action-orb \{ transition:none/);
});
