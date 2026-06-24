#!/usr/bin/env node
/**
 * Palette audit: WCAG 2.x AA, APCA, OKLCH ramp health.
 * Usage: node scripts/audit-palette.mjs [--fix]
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { converter, formatHex, parse, wcagContrast } from 'culori';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import {
  ALERT_ICON,
  MID_CHROMA_HUES,
  RAMP_GROUPS,
  SEMANTIC_PAIRS,
  THEME_DARK,
  THEME_LIGHT,
} from './semantic-pairs.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TOKENS_PATH = join(ROOT, 'src/tokens/tokens.css');
const INDEX_PATH = join(ROOT, 'index.html');
const CONTEXT_PATH = join(ROOT, '..', '..', 'CONTEXT.md');
const REPORT_PATH = join(__dirname, 'palette-audit-report.md');

const FIX = process.argv.includes('--fix');
const MAX_DL = 0.06;
const L_STEP = 0.01;

const toOklch = converter('oklch');

function parseColors(css) {
  const colors = {};
  const regex = /--(color-[a-z-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g;
  let m;
  while ((m = regex.exec(css)) !== null) {
    colors[m[1]] = m[2].toUpperCase();
  }
  return colors;
}

function writeColors(css, colors) {
  let out = css;
  for (const [key, hex] of Object.entries(colors)) {
    const re = new RegExp(`(--${key}:\\s*)#[0-9A-Fa-f]{6}`, 'g');
    out = out.replace(re, `$1${hex}`);
  }
  return out;
}

function resolveToken(key, theme) {
  if (key.startsWith('color-')) return key;
  return theme[key] ?? key;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function apcaLc(textHex, bgHex) {
  const textY = sRGBtoY(hexToRgb(textHex));
  const bgY = sRGBtoY(hexToRgb(bgHex));
  return Math.abs(APCAcontrast(textY, bgY));
}

function scorePair(fgHex, bgHex, minRatio) {
  const ratio = wcagContrast(fgHex, bgHex);
  const lc = apcaLc(fgHex, bgHex);
  return { ratio, lc, pass: ratio >= minRatio };
}

function nudgeFgForContrast(fgHex, bgHex, minRatio) {
  const start = toOklch(fgHex);
  if (!start || start.l == null) return { hex: fgHex, changed: false, manual: true };

  const bgL = toOklch(bgHex)?.l ?? 0.5;
  const direction = (start.l ?? 0.5) > bgL ? -1 : 1;
  const startL = start.l ?? 0.5;

  for (let i = 1; i <= Math.round(MAX_DL / L_STEP); i++) {
    const trial = {
      mode: 'oklch',
      l: Math.min(1, Math.max(0, startL + direction * L_STEP * i)),
      c: start.c ?? 0,
      h: start.h ?? 0,
    };
    const hex = formatHex(trial)?.toUpperCase();
    if (!hex) continue;
    if (wcagContrast(hex, bgHex) >= minRatio) {
      return { hex, changed: hex !== fgHex.toUpperCase(), manual: false, deltaL: direction * L_STEP * i };
    }
  }
  return { hex: fgHex, changed: false, manual: true };
}

function auditSemantic(colors, mode, theme) {
  const results = [];
  for (const pair of SEMANTIC_PAIRS) {
    let fgKey = resolveToken(pair.fg, theme);
    if (ALERT_ICON[mode]?.[pair.label]) fgKey = ALERT_ICON[mode][pair.label];
    const bgKey = resolveToken(pair.bg, theme);
    const fgHex = colors[fgKey];
    const bgHex = colors[bgKey];
    if (!fgHex || !bgHex) {
      results.push({ mode, ...pair, fgKey, bgKey, error: 'missing color' });
      continue;
    }
    const { ratio, lc, pass } = scorePair(fgHex, bgHex, pair.minRatio);
    const apcaWarn = pair.type === 'text' ? lc < 60 : lc < 45;
    const apcaSevere = lc < 45;
    results.push({
      mode,
      ...pair,
      fgKey,
      bgKey,
      fgHex,
      bgHex,
      ratio,
      lc,
      pass,
      apcaWarn,
      apcaSevere,
      structural: Boolean(pair.structural),
    });
  }
  return results;
}

function auditRamps(colors) {
  const issues = [];
  for (const [name, keys] of Object.entries(RAMP_GROUPS)) {
    const shades = keys.map(k => ({ key: k, hex: colors[k], oklch: toOklch(colors[k]) })).filter(s => s.oklch);

    for (let i = 1; i < shades.length; i++) {
      if ((shades[i].oklch.l ?? 0) <= (shades[i - 1].oklch.l ?? 0)) {
        issues.push({ ramp: name, type: 'monotonicity', msg: `${shades[i - 1].key} → ${shades[i].key} lightness not increasing` });
      }
      const hueDelta = Math.abs((shades[i].oklch.h ?? 0) - (shades[i - 1].oklch.h ?? 0));
      const hueJump = hueDelta > 180 ? 360 - hueDelta : hueDelta;
      if (hueJump > 15 && i > 0 && i < shades.length - 1) {
        issues.push({ ramp: name, type: 'hue-drift', msg: `${shades[i - 1].key} → ${shades[i].key}: Δh ${hueJump.toFixed(1)}°` });
      }
    }

    const steps = [];
    for (let i = 1; i < shades.length; i++) {
      steps.push((shades[i].oklch.l ?? 0) - (shades[i - 1].oklch.l ?? 0));
    }
    if (steps.length) {
      const median = steps.slice().sort((a, b) => a - b)[Math.floor(steps.length / 2)];
      steps.forEach((step, i) => {
        if (step < median * 0.5 || step > median * 2) {
          issues.push({
            ramp: name,
            type: 'step-evenness',
            msg: `${keys[i]} → ${keys[i + 1]}: ΔL ${step.toFixed(3)} (median ${median.toFixed(3)})`,
          });
        }
      });
    }
  }

  const chromas = MID_CHROMA_HUES.map(k => ({ key: k, c: toOklch(colors[k])?.c ?? 0 }));
  const medianC = chromas.map(x => x.c).sort((a, b) => a - b)[1];
  for (const { key, c } of chromas) {
    if (c > medianC * 1.5) {
      issues.push({ ramp: key, type: 'mid-chroma', msg: `${key} chroma ${c.toFixed(3)} > 1.5× median ${medianC.toFixed(3)}` });
    }
  }

  return issues;
}

function applyFixes(colors, lightResults, darkResults) {
  const fixes = [];
  const manual = [];
  const all = [...lightResults, ...darkResults].filter(r => !r.error && !r.pass);
  all.sort((a, b) => a.ratio - b.ratio);

  for (const r of all) {
    const fgHex = colors[r.fgKey];
    const bgHex = colors[resolveToken(r.bg, r.mode === 'light' ? THEME_LIGHT : THEME_DARK)];
    if (!fgHex || !bgHex) continue;
    if (wcagContrast(fgHex, bgHex) >= r.minRatio) continue;

    const { hex, changed, manual: isManual, deltaL } = nudgeFgForContrast(fgHex, bgHex, r.minRatio);
    if (isManual) {
      if (!manual.some(m => m.mode === r.mode && m.label === r.label)) manual.push(r);
      continue;
    }
    if (changed) {
      colors[r.fgKey] = hex;
      fixes.push({ ...r, oldHex: fgHex, newHex: hex, deltaL });
    }
  }
  return { fixes, manual };
}

function syncIndexHtml(html, colors) {
  let out = html;
  for (const [key, hex] of Object.entries(colors)) {
    const swatchClass = key.replace('color-', '');
    const re = new RegExp(
      `(class="swatch-face swatch-face--${swatchClass}"[^>]*>\\s*</div>\\s*<div class="token-name">[^<]*</div>\\s*<div class="token-value">)#[0-9A-Fa-f]{6}`,
      'i'
    );
    out = out.replace(re, `$1${hex}`);
  }
  return out;
}

function syncContextMd(md, colors) {
  const hueOrder = ['red', 'green', 'blue', 'pink', 'yellow', 'cyan'];
  const shadeSuffix = ['extra-dark', 'dark', '', 'light', 'extra-light'];
  const shadeKeys = suffix =>
    suffix ? `color-${suffix.split('-').length > 1 ? '' : ''}` : '';

  function rampHex(hue) {
    return [
      colors[`color-${hue}-extra-dark`],
      colors[`color-${hue}-dark`],
      colors[`color-${hue}`],
      colors[`color-${hue}-light`],
      colors[`color-${hue}-extra-light`],
    ].join('` · `');
  }

  const gray = `${colors['color-black']} · ${colors['color-gray-extra-dark']} · ${colors['color-dark-gray']} · ${colors['color-gray']} · ${colors['color-light-gray']} · ${colors['color-gray-extra-light']} · ${colors['color-white']}`;
  const ramps = hueOrder.map(h => {
    const label = h.charAt(0).toUpperCase() + h.slice(1);
    return `${label} (\`${rampHex(h)}\`)`;
  }).join(', ');

  const lineRe = /^- \*\*Colors\*\* — .+$/m;
  const newLine = `- **Colors** — 5 grayscale steps + 6 hues × 5 shades each (Extra Dark · Dark · Mid · Light · Extra Light); endpoint shades carry a subtle yellow warmth, with hue-specific twists (yellow darkens toward orange, cyan darkens toward teal, blue lightens toward cyan). ${ramps.join(', ')}; grayscale \`${gray}\``;

  if (lineRe.test(md)) {
    return md.replace(lineRe, newLine);
  }
  return md;
}

function buildReport(light, dark, rampIssues, fixes, manual, runFix) {
  const now = new Date().toISOString().slice(0, 10);
  const failLight = light.filter(r => !r.pass && !r.error && !r.structural);
  const failDark = dark.filter(r => !r.pass && !r.error && !r.structural);
  const structuralFails = [...light, ...dark].filter(r => !r.pass && !r.error && r.structural);
  const apcaFlags = [...light, ...dark].filter(r => r.apcaWarn && !r.error);

  let md = `# Palette audit report\n\nGenerated: ${now}${runFix ? ' (after --fix)' : ''}\n\n`;
  md += `## Summary\n\n`;
  md += `- Light mode WCAG failures: **${failLight.length}**\n`;
  md += `- Dark mode WCAG failures: **${failDark.length}**\n`;
  md += `- APCA review flags (Lc < 60 text / < 45 UI): **${apcaFlags.length}**\n`;
  md += `- Ramp health issues: **${rampIssues.length}** (report-only)\n`;
  md += `- Structural border pairs (documented, exempt): **${structuralFails.length}**\n`;
  if (runFix) {
    md += `- Auto-fixes applied: **${fixes.length}**\n`;
    md += `- Manual review needed: **${manual.length}**\n`;
  }
  md += `\n## WCAG 2.x AA pairs\n\n`;
  md += `| Mode | Pair | FG | BG | Ratio | Min | APCA Lc | Pass |\n`;
  md += `|------|------|----|----|-------|-----|---------|------|\n`;
  for (const r of [...light, ...dark]) {
    if (r.error) continue;
    md += `| ${r.mode} | ${r.label} | \`${r.fgHex}\` | \`${r.bgHex}\` | ${r.ratio.toFixed(2)} | ${r.minRatio} | ${r.lc.toFixed(0)} | ${r.pass ? '✓' : r.structural ? '—' : '✗'} |\n`;
  }

  if (apcaFlags.length) {
    md += `\n## APCA review\n\n`;
    for (const r of apcaFlags) {
      md += `- **${r.mode}** ${r.label}: Lc ${r.lc.toFixed(0)} (${r.fgHex} on ${r.bgHex})\n`;
    }
  }

  if (fixes.length) {
    md += `\n## Auto-fixes\n\n`;
    for (const f of fixes) {
      md += `- \`${f.fgKey}\`: ${f.fgHex} → **${f.newHex}** (ΔL ${f.deltaL?.toFixed(3) ?? '?'})\n`;
    }
  }

  if (manual.length) {
    md += `\n## Manual review required\n\n`;
    md += `Pairs that exceed the auto-fix OKLCH cap (ΔL ≤ 0.06) or have structural constraints (light border shades on light backgrounds per current scheme mapping).\n\n`;
    for (const r of manual) {
      md += `- **${r.mode}** ${r.label}: ${r.ratio.toFixed(2)}:1 (need ${r.minRatio}) — \`${r.fgKey}\` on \`${r.bgKey}\`\n`;
    }
  }

  if (structuralFails.length) {
    md += `\n## Structural pairs (scheme mapping — not auto-fixed)\n\n`;
    md += `Light borders use L shades; tinted backgrounds use XL/XD. These are intentionally subtle and do not meet 3:1 without remapping.\n\n`;
    for (const r of structuralFails) {
      md += `- **${r.mode}** ${r.label}: ${r.ratio.toFixed(2)}:1 — \`${r.fgHex}\` on \`${r.bgHex}\`\n`;
    }
  }

  if (rampIssues.length) {
    md += `\n## Ramp health (informational)\n\n`;
    for (const i of rampIssues) {
      md += `- **${i.ramp}** [${i.type}]: ${i.msg}\n`;
    }
  }

  md += `\n## Thresholds\n\n`;
  md += `- WCAG AA: 4.5:1 text, 3:1 UI components\n`;
  md += `- APCA: flag Lc < 60 (text), < 45 (severe / UI)\n`;
  md += `- Auto-fix: OKLCH L nudge ≤ 0.06 on foreground token only\n`;

  return md;
}

function main() {
  let css = readFileSync(TOKENS_PATH, 'utf8');
  let colors = parseColors(css);

  const lightResults = auditSemantic(colors, 'light', THEME_LIGHT);
  const darkResults = auditSemantic(colors, 'dark', THEME_DARK);
  const rampIssues = auditRamps(colors);

  let fixes = [];
  let manual = [];

  if (FIX) {
    let iterations = 0;
    while (iterations < 5) {
      const lr = auditSemantic(colors, 'light', THEME_LIGHT);
      const dr = auditSemantic(colors, 'dark', THEME_DARK);
      const { fixes: roundFixes, manual: roundManual } = applyFixes(colors, lr, dr);
      manual = roundManual;
      if (!roundFixes.length) break;
      fixes.push(...roundFixes);
      iterations++;
    }

    if (fixes.length) {
      css = writeColors(css, colors);
      writeFileSync(TOKENS_PATH, css);

      let indexHtml = readFileSync(INDEX_PATH, 'utf8');
      indexHtml = syncIndexHtml(indexHtml, colors);
      writeFileSync(INDEX_PATH, indexHtml);

      try {
        let context = readFileSync(CONTEXT_PATH, 'utf8');
        context = syncContextMd(context, colors);
        writeFileSync(CONTEXT_PATH, context);
      } catch {
        // CONTEXT.md optional path
      }
    }

    colors = parseColors(css);
  }

  const finalLight = auditSemantic(colors, 'light', THEME_LIGHT);
  const finalDark = auditSemantic(colors, 'dark', THEME_DARK);
  const report = buildReport(finalLight, finalDark, rampIssues, fixes, manual, FIX);
  writeFileSync(REPORT_PATH, report);

  const failCount = finalLight.filter(r => !r.pass && !r.error && !r.structural).length
    + finalDark.filter(r => !r.pass && !r.error && !r.structural).length;

  console.log(report.split('\n').slice(0, 12).join('\n'));
  console.log(`\nFull report: ${REPORT_PATH}`);

  if (FIX && fixes.length) {
    console.log(`\nApplied ${fixes.length} fix(es). Re-run: npm run audit:colors`);
  }
  if (manual.length) {
    console.log(`\n${manual.length} pair(s) need manual review (see report).`);
  }

  process.exit(failCount > 0 ? 1 : 0);
}

main();
