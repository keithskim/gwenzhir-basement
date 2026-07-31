#!/usr/bin/env node
/**
 * Generate translucent (--color-*-a) tokens that match each solid when
 * composited over the light (white) or dark (black) page background.
 *
 * Algorithm adapted from Radix Colors alpha-scale generation.
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

function hexToRgb01(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function blendAlpha(foreground, alpha, background, round = true) {
  if (round) {
    return Math.round(background * (1 - alpha)) + Math.round(foreground * alpha);
  }
  return background * (1 - alpha) + foreground * alpha;
}

function getAlphaColor(targetRgb, backgroundRgb, rgbPrecision, alphaPrecision, targetAlpha) {
  const [tr, tg, tb] = targetRgb.map((c) => Math.round(c * rgbPrecision));
  const [br, bg, bb] = backgroundRgb.map((c) => Math.round(c * rgbPrecision));

  if (tr === br && tg === bg && tb === bb) {
    return [0, 0, 0, 0];
  }

  let desiredRgb = 0;
  if (tr > br) desiredRgb = rgbPrecision;
  else if (tg > bg) desiredRgb = rgbPrecision;
  else if (tb > bb) desiredRgb = rgbPrecision;

  const alphaR = (tr - br) / (desiredRgb - br);
  const alphaG = (tg - bg) / (desiredRgb - bg);
  const alphaB = (tb - bb) / (desiredRgb - bb);
  const alphas = [alphaR, alphaG, alphaB];
  const pureGray =
    alphas.every((a) => Number.isFinite(a)) &&
    Math.abs(alphaR - alphaG) < 1e-9 &&
    Math.abs(alphaG - alphaB) < 1e-9;

  if (!targetAlpha && pureGray) {
    return [desiredRgb / rgbPrecision, desiredRgb / rgbPrecision, desiredRgb / rgbPrecision, alphaR];
  }

  const clampRgb = (n) => (Number.isNaN(n) ? 0 : Math.min(rgbPrecision, Math.max(0, n)));
  const clampA = (n) => (Number.isNaN(n) ? 0 : Math.min(alphaPrecision, Math.max(0, n)));
  const safeAlphas = alphas.map((a) => (Number.isFinite(a) ? a : 0));
  const maxAlpha = targetAlpha ?? Math.max(...safeAlphas);
  const A = clampA(Math.ceil(maxAlpha * alphaPrecision)) / alphaPrecision;

  if (A === 0) return [0, 0, 0, 0];

  let R = clampRgb(((br * (1 - A) - tr) / A) * -1);
  let G = clampRgb(((bg * (1 - A) - tg) / A) * -1);
  let B = clampRgb(((bb * (1 - A) - tb) / A) * -1);

  R = Math.ceil(R);
  G = Math.ceil(G);
  B = Math.ceil(B);

  const blendedR = blendAlpha(R, A, br);
  const blendedG = blendAlpha(G, A, bg);
  const blendedB = blendAlpha(B, A, bb);

  if (desiredRgb === 0) {
    if (tr <= br && tr !== blendedR) R = tr > blendedR ? R + 1 : R - 1;
    if (tg <= bg && tg !== blendedG) G = tg > blendedG ? G + 1 : G - 1;
    if (tb <= bb && tb !== blendedB) B = tb > blendedB ? B + 1 : B - 1;
  }

  if (desiredRgb === rgbPrecision) {
    if (tr >= br && tr !== blendedR) R = tr > blendedR ? R + 1 : R - 1;
    if (tg >= bg && tg !== blendedG) G = tg > blendedG ? G + 1 : G - 1;
    if (tb >= bb && tb !== blendedB) B = tb > blendedB ? B + 1 : B - 1;
  }

  return [
    Math.min(rgbPrecision, Math.max(0, R)) / rgbPrecision,
    Math.min(rgbPrecision, Math.max(0, G)) / rgbPrecision,
    Math.min(rgbPrecision, Math.max(0, B)) / rgbPrecision,
    A,
  ];
}

function toHex8([r, g, b, a]) {
  const chan = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${chan(r)}${chan(g)}${chan(b)}${chan(a)}`.toUpperCase();
}

function formatBlock(colors, background, indent = '  ') {
  return Object.keys(colors)
    .map((name) => {
      const rgba = getAlphaColor(hexToRgb01(colors[name]), hexToRgb01(background), 255, 255);
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
