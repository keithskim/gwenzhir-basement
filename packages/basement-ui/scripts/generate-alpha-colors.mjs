#!/usr/bin/env node
/**
 * Generate translucent (--color-*-a) tokens that match each solid when
 * composited over the light (white) or dark (black) page background.
 *
 * Solves the compositing equation for the smallest alpha at which every
 * channel of the solid is reachable, so each token composites back to its
 * solid exactly. Colors the background cannot be diluted or lifted to reach
 * fall back to fully opaque.
 *
 * Usage: node scripts/generate-alpha-colors.mjs [--write]
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TOKENS_PATH = join(ROOT, 'src/tokens/tokens.css');
const WRITE = process.argv.includes('--write');

const BEGIN = '/* ── Translucent (alpha) ── */';
const END = '/* ── /Translucent (alpha) ── */';

function parseSolidColors(css) {
  const colors = {};
  const regex = /--(color-[a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g;
  let m;
  while ((m = regex.exec(css)) !== null) {
    // Skip existing alpha tokens if any were ever written as 6-digit
    if (m[1].endsWith('-a')) continue;
    colors[m[1]] = m[2].toUpperCase();
  }
  return colors;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function blendAlpha(foreground, alpha, background) {
  return Math.round(background * (1 - alpha) + foreground * alpha);
}

/**
 * Lowest alpha at which every channel of the target is reachable: a channel
 * darker than the background has to dilute the background away, a lighter one
 * has to lift it toward full intensity. Below this alpha the channel clamps
 * and the composite drifts off the solid.
 */
function minimumAlpha(target, background) {
  return Math.max(
    ...target.map((t, i) => {
      const b = background[i];
      if (t < b) return (b - t) / b;
      if (t > b) return (t - b) / (255 - b);
      return 0;
    })
  );
}

/**
 * Overlay channel value that composites to `target` at this alpha, or null if
 * no 8-bit value does. Among the values that land on target, the one closest
 * to the unrounded solution survives rounding differences best.
 */
function solveChannel(target, background, alpha) {
  const ideal = (target - background * (1 - alpha)) / alpha;
  const rounded = Math.round(ideal);
  let best = null;
  for (const candidate of [rounded - 1, rounded, rounded + 1]) {
    const value = Math.min(255, Math.max(0, candidate));
    if (blendAlpha(value, alpha, background) !== target) continue;
    const error = Math.abs(background * (1 - alpha) + value * alpha - target);
    if (!best || error < best.error) best = { value, error };
  }
  return best ? best.value : null;
}

function getAlphaColor(target, background) {
  if (target.every((t, i) => t === background[i])) return [0, 0, 0, 0];

  const start = Math.max(1, Math.ceil(minimumAlpha(target, background) * 255));
  for (let steps = start; steps < 255; steps++) {
    const alpha = steps / 255;
    const channels = target.map((t, i) => solveChannel(t, background[i], alpha));
    if (channels.every((c) => c !== null)) return [...channels, steps];
  }
  return [...target, 255];
}

function toHex8(rgba) {
  return `#${rgba.map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function formatBlock(colors, background, indent = '  ') {
  const backgroundRgb = hexToRgb(background);
  return Object.keys(colors)
    .map((name) => {
      const target = hexToRgb(colors[name]);
      const rgba = getAlphaColor(target, backgroundRgb);
      const alpha = rgba[3] / 255;
      const blended = rgba.slice(0, 3).map((c, i) => blendAlpha(c, alpha, backgroundRgb[i]));
      if (blended.some((c, i) => c !== target[i])) {
        console.warn(`Warning: --${name}-a composites to ${toHex8([...blended, 255]).slice(0, 7)}, not ${colors[name]}`);
      }
      return `${indent}--${name}-a: ${toHex8(rgba)};`;
    })
    .join('\n');
}

function wrapRoot(block) {
  return `  ${BEGIN}
  /* Match solids when composited over --color-white (light page bg). */
${block}
  ${END}`;
}

function wrapDark(block) {
  return `  ${BEGIN}
  /* Match solids when composited over --color-black (dark page bg). */
${block}
  ${END}`;
}

function upsertBlock(css, markerStart, markerEnd, replacement, { insideSelector }) {
  let startIdx = css.indexOf(markerStart);
  const endIdx = css.indexOf(markerEnd);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // Include leading whitespace on the marker line so re-writes stay tidy.
    while (startIdx > 0 && (css[startIdx - 1] === ' ' || css[startIdx - 1] === '\t')) {
      startIdx--;
    }
    const before = css.slice(0, startIdx);
    const after = css.slice(endIdx + markerEnd.length);
    return `${before}${replacement}${after}`;
  }

  // Insert after the last solid color declaration when adding for the first time.
  const colorAnchor = '--color-cyan-extra-light:';
  const anchorIdx = css.indexOf(colorAnchor, css.indexOf(insideSelector));
  if (insideSelector.startsWith(':root') && anchorIdx !== -1) {
    const lineEnd = css.indexOf('\n', anchorIdx);
    const insertAt = lineEnd === -1 ? css.length : lineEnd + 1;
    return `${css.slice(0, insertAt)}\n${replacement}\n${css.slice(insertAt)}`;
  }

  // Fallback: insert before the closing brace of the selector block.
  const selIdx = css.indexOf(insideSelector);
  if (selIdx === -1) {
    throw new Error(`Could not find selector ${insideSelector}`);
  }
  let depth = 0;
  let insertAt = -1;
  for (let i = selIdx; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) {
        insertAt = i;
        break;
      }
    }
  }
  if (insertAt === -1) throw new Error(`Could not find end of ${insideSelector}`);
  return `${css.slice(0, insertAt)}\n${replacement}\n${css.slice(insertAt)}`;
}

const css = readFileSync(TOKENS_PATH, 'utf8');
const colors = parseSolidColors(css);
const white = colors['color-white'];
const black = colors['color-black'];
if (!white || !black) {
  throw new Error('Missing --color-white or --color-black');
}

const lightBlock = wrapRoot(formatBlock(colors, white));
const darkBlock = wrapDark(formatBlock(colors, black));

let next = css;
next = upsertBlock(next, BEGIN, END, lightBlock, { insideSelector: ':root {' });
// After first upsert there are two potential BEGIN markers if dark already exists;
// upsert dark inside html.is-dark specifically by searching within that rule.
const darkSel = 'html.is-dark {';
const darkStart = next.indexOf(darkSel);
if (darkStart === -1) throw new Error('Missing html.is-dark block');
const beforeDark = next.slice(0, darkStart);
const darkAndAfter = next.slice(darkStart);
const darkUpdated = upsertBlock(darkAndAfter, BEGIN, END, darkBlock, {
  insideSelector: darkSel,
});
next = beforeDark + darkUpdated;

if (WRITE) {
  writeFileSync(TOKENS_PATH, next);
  console.log(`Wrote translucent tokens to ${TOKENS_PATH}`);
} else {
  console.log(lightBlock);
  console.log('');
  console.log(darkBlock);
  console.log('\n(Dry run — pass --write to update tokens.css)');
}
