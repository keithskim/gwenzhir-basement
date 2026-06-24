# Palette audit report

Generated: 2026-06-15 (after --fix)

## Summary

- Light mode WCAG failures: **0**
- Dark mode WCAG failures: **0**
- APCA review flags (Lc < 60 text / < 45 UI): **22**
- Ramp health issues: **9** (report-only)
- Structural border pairs (documented, exempt): **17**
- Auto-fixes applied: **0**
- Manual review needed: **17**

## WCAG 2.x AA pairs

| Mode | Pair | FG | BG | Ratio | Min | APCA Lc | Pass |
|------|------|----|----|-------|-----|---------|------|
| light | Primary text | `#111210` | `#FFFFFC` | 18.75 | 4.5 | 105 | ✓ |
| light | Body text | `#626462` | `#FFFFFC` | 5.96 | 4.5 | 80 | ✓ |
| light | Secondary text | `#757775` | `#FFFFFC` | 4.51 | 4.5 | 71 | ✓ |
| light | Affirm text on page | `#237038` | `#FFFFFC` | 6.08 | 4.5 | 80 | ✓ |
| light | Warn text on page | `#8A6600` | `#FFFFFC` | 5.27 | 4.5 | 76 | ✓ |
| light | Destructive text on page | `#BC3618` | `#FFFFFC` | 5.70 | 4.5 | 77 | ✓ |
| light | Affirm text on affirm bg | `#237038` | `#F0FCF2` | 5.78 | 4.5 | 76 | ✓ |
| light | Warn text on warn bg | `#8A6600` | `#FFFAE8` | 5.05 | 4.5 | 73 | ✓ |
| light | Destructive text on destructive bg | `#BC3618` | `#FFF4EC` | 5.27 | 4.5 | 72 | ✓ |
| light | Resting border on page | `#DDDDDD` | `#FFFFFC` | 1.36 | 3 | 17 | — |
| light | Affirm border on page | `#ACEBC4` | `#FFFFFC` | 1.36 | 3 | 17 | — |
| light | Warn border on page | `#FFEB80` | `#FFFFFC` | 1.20 | 3 | 10 | — |
| light | Destructive border on page | `#FFAA88` | `#FFFFFC` | 1.85 | 3 | 34 | — |
| light | Affirm border on affirm bg | `#ACEBC4` | `#F0FCF2` | 1.29 | 3 | 14 | — |
| light | Warn border on warn bg | `#FFEB80` | `#FFFAE8` | 1.15 | 3 | 0 | — |
| light | Destructive border on destructive bg | `#FFAA88` | `#FFF4EC` | 1.71 | 3 | 29 | — |
| light | Alert neutral text | `#626462` | `#FFFFFC` | 5.96 | 4.5 | 80 | ✓ |
| light | Alert neutral border | `#DDDDDD` | `#FFFFFC` | 1.36 | 3 | 17 | — |
| light | Alert neutral icon | `#111210` | `#FFFFFC` | 18.75 | 3 | 105 | ✓ |
| light | Alert affirm text | `#237038` | `#F0FCF2` | 5.78 | 4.5 | 76 | ✓ |
| light | Alert affirm border | `#ACEBC4` | `#F0FCF2` | 1.29 | 3 | 14 | — |
| light | Alert affirm icon | `#237038` | `#F0FCF2` | 5.78 | 3 | 76 | ✓ |
| light | Alert warn text | `#8A6600` | `#FFFAE8` | 5.05 | 4.5 | 73 | ✓ |
| light | Alert warn border | `#FFEB80` | `#FFFAE8` | 1.15 | 3 | 0 | — |
| light | Alert warn icon | `#8A6600` | `#FFFAE8` | 5.05 | 3 | 73 | ✓ |
| light | Alert destructive text | `#BC3618` | `#FFF4EC` | 5.27 | 4.5 | 72 | ✓ |
| light | Alert destructive border | `#FFAA88` | `#FFF4EC` | 1.71 | 3 | 29 | — |
| light | Alert destructive icon | `#EC5844` | `#FFF4EC` | 3.21 | 3 | 56 | ✓ |
| dark | Primary text | `#FFFFFC` | `#111210` | 18.75 | 4.5 | 107 | ✓ |
| dark | Body text | `#DDDDDD` | `#111210` | 13.83 | 4.5 | 85 | ✓ |
| dark | Secondary text | `#DDDDDD` | `#111210` | 13.83 | 4.5 | 85 | ✓ |
| dark | Affirm text on page | `#ACEBC4` | `#111210` | 13.81 | 4.5 | 85 | ✓ |
| dark | Warn text on page | `#FFEB80` | `#111210` | 15.61 | 4.5 | 94 | ✓ |
| dark | Destructive text on page | `#FFAA88` | `#111210` | 10.16 | 4.5 | 67 | ✓ |
| dark | Affirm text on affirm bg | `#ACEBC4` | `#10301A` | 10.57 | 4.5 | 82 | ✓ |
| dark | Warn text on warn bg | `#FFEB80` | `#4E3000` | 9.99 | 4.5 | 87 | ✓ |
| dark | Destructive text on destructive bg | `#FFAA88` | `#641400` | 6.92 | 4.5 | 61 | ✓ |
| dark | Resting border on page | `#626462` | `#111210` | 3.15 | 3 | 21 | ✓ |
| dark | Affirm border on page | `#237038` | `#111210` | 3.08 | 3 | 21 | ✓ |
| dark | Warn border on page | `#8A6600` | `#111210` | 3.56 | 3 | 25 | ✓ |
| dark | Destructive border on page | `#BC3618` | `#111210` | 3.29 | 3 | 24 | ✓ |
| dark | Affirm border on affirm bg | `#237038` | `#10301A` | 2.36 | 3 | 18 | — |
| dark | Warn border on warn bg | `#8A6600` | `#4E3000` | 2.28 | 3 | 19 | — |
| dark | Destructive border on destructive bg | `#BC3618` | `#641400` | 2.24 | 3 | 18 | — |
| dark | Alert neutral text | `#DDDDDD` | `#111210` | 13.83 | 4.5 | 85 | ✓ |
| dark | Alert neutral border | `#626462` | `#111210` | 3.15 | 3 | 21 | ✓ |
| dark | Alert neutral icon | `#FFFFFC` | `#111210` | 18.75 | 3 | 107 | ✓ |
| dark | Alert affirm text | `#ACEBC4` | `#10301A` | 10.57 | 4.5 | 82 | ✓ |
| dark | Alert affirm border | `#237038` | `#10301A` | 2.36 | 3 | 18 | — |
| dark | Alert affirm icon | `#ACEBC4` | `#10301A` | 10.57 | 3 | 82 | ✓ |
| dark | Alert warn text | `#FFEB80` | `#4E3000` | 9.99 | 4.5 | 87 | ✓ |
| dark | Alert warn border | `#8A6600` | `#4E3000` | 2.28 | 3 | 19 | — |
| dark | Alert warn icon | `#FFEB80` | `#4E3000` | 9.99 | 3 | 87 | ✓ |
| dark | Alert destructive text | `#FFAA88` | `#641400` | 6.92 | 4.5 | 61 | ✓ |
| dark | Alert destructive border | `#BC3618` | `#641400` | 2.24 | 3 | 18 | — |
| dark | Alert destructive icon | `#FFAA88` | `#641400` | 6.92 | 3 | 61 | ✓ |

## APCA review

- **light** Resting border on page: Lc 17 (#DDDDDD on #FFFFFC)
- **light** Affirm border on page: Lc 17 (#ACEBC4 on #FFFFFC)
- **light** Warn border on page: Lc 10 (#FFEB80 on #FFFFFC)
- **light** Destructive border on page: Lc 34 (#FFAA88 on #FFFFFC)
- **light** Affirm border on affirm bg: Lc 14 (#ACEBC4 on #F0FCF2)
- **light** Warn border on warn bg: Lc 0 (#FFEB80 on #FFFAE8)
- **light** Destructive border on destructive bg: Lc 29 (#FFAA88 on #FFF4EC)
- **light** Alert neutral border: Lc 17 (#DDDDDD on #FFFFFC)
- **light** Alert affirm border: Lc 14 (#ACEBC4 on #F0FCF2)
- **light** Alert warn border: Lc 0 (#FFEB80 on #FFFAE8)
- **light** Alert destructive border: Lc 29 (#FFAA88 on #FFF4EC)
- **dark** Resting border on page: Lc 21 (#626462 on #111210)
- **dark** Affirm border on page: Lc 21 (#237038 on #111210)
- **dark** Warn border on page: Lc 25 (#8A6600 on #111210)
- **dark** Destructive border on page: Lc 24 (#BC3618 on #111210)
- **dark** Affirm border on affirm bg: Lc 18 (#237038 on #10301A)
- **dark** Warn border on warn bg: Lc 19 (#8A6600 on #4E3000)
- **dark** Destructive border on destructive bg: Lc 18 (#BC3618 on #641400)
- **dark** Alert neutral border: Lc 21 (#626462 on #111210)
- **dark** Alert affirm border: Lc 18 (#237038 on #10301A)
- **dark** Alert warn border: Lc 19 (#8A6600 on #4E3000)
- **dark** Alert destructive border: Lc 18 (#BC3618 on #641400)

## Manual review required

Pairs that exceed the auto-fix OKLCH cap (ΔL ≤ 0.06) or have structural constraints (light border shades on light backgrounds per current scheme mapping).

- **light** Warn border on warn bg: 1.15:1 (need 3) — `color-yellow-light` on `color-yellow-extra-light`
- **light** Alert warn border: 1.15:1 (need 3) — `color-yellow-light` on `color-yellow-extra-light`
- **light** Warn border on page: 1.20:1 (need 3) — `color-yellow-light` on `color-white`
- **light** Affirm border on affirm bg: 1.29:1 (need 3) — `color-green-light` on `color-green-extra-light`
- **light** Alert affirm border: 1.29:1 (need 3) — `color-green-light` on `color-green-extra-light`
- **light** Resting border on page: 1.36:1 (need 3) — `color-light-gray` on `color-white`
- **light** Alert neutral border: 1.36:1 (need 3) — `color-light-gray` on `color-white`
- **light** Affirm border on page: 1.36:1 (need 3) — `color-green-light` on `color-white`
- **light** Destructive border on destructive bg: 1.71:1 (need 3) — `color-red-light` on `color-red-extra-light`
- **light** Alert destructive border: 1.71:1 (need 3) — `color-red-light` on `color-red-extra-light`
- **light** Destructive border on page: 1.85:1 (need 3) — `color-red-light` on `color-white`
- **dark** Destructive border on destructive bg: 2.24:1 (need 3) — `color-red-dark` on `color-red-extra-dark`
- **dark** Alert destructive border: 2.24:1 (need 3) — `color-red-dark` on `color-red-extra-dark`
- **dark** Warn border on warn bg: 2.28:1 (need 3) — `color-yellow-dark` on `color-yellow-extra-dark`
- **dark** Alert warn border: 2.28:1 (need 3) — `color-yellow-dark` on `color-yellow-extra-dark`
- **dark** Affirm border on affirm bg: 2.36:1 (need 3) — `color-green-dark` on `color-green-extra-dark`
- **dark** Alert affirm border: 2.36:1 (need 3) — `color-green-dark` on `color-green-extra-dark`

## Structural pairs (scheme mapping — not auto-fixed)

Light borders use L shades; tinted backgrounds use XL/XD. These are intentionally subtle and do not meet 3:1 without remapping.

- **light** Resting border on page: 1.36:1 — `#DDDDDD` on `#FFFFFC`
- **light** Affirm border on page: 1.36:1 — `#ACEBC4` on `#FFFFFC`
- **light** Warn border on page: 1.20:1 — `#FFEB80` on `#FFFFFC`
- **light** Destructive border on page: 1.85:1 — `#FFAA88` on `#FFFFFC`
- **light** Affirm border on affirm bg: 1.29:1 — `#ACEBC4` on `#F0FCF2`
- **light** Warn border on warn bg: 1.15:1 — `#FFEB80` on `#FFFAE8`
- **light** Destructive border on destructive bg: 1.71:1 — `#FFAA88` on `#FFF4EC`
- **light** Alert neutral border: 1.36:1 — `#DDDDDD` on `#FFFFFC`
- **light** Alert affirm border: 1.29:1 — `#ACEBC4` on `#F0FCF2`
- **light** Alert warn border: 1.15:1 — `#FFEB80` on `#FFFAE8`
- **light** Alert destructive border: 1.71:1 — `#FFAA88` on `#FFF4EC`
- **dark** Affirm border on affirm bg: 2.36:1 — `#237038` on `#10301A`
- **dark** Warn border on warn bg: 2.28:1 — `#8A6600` on `#4E3000`
- **dark** Destructive border on destructive bg: 2.24:1 — `#BC3618` on `#641400`
- **dark** Alert affirm border: 2.36:1 — `#237038` on `#10301A`
- **dark** Alert warn border: 2.28:1 — `#8A6600` on `#4E3000`
- **dark** Alert destructive border: 2.24:1 — `#BC3618` on `#641400`

## Ramp health (informational)

- **grayscale** [hue-drift]: color-black → color-dark-gray: Δh 16.8°
- **grayscale** [hue-drift]: color-gray → color-light-gray: Δh 145.5°
- **grayscale** [step-evenness]: color-dark-gray → color-gray: ΔL 0.066 (median 0.321)
- **grayscale** [step-evenness]: color-light-gray → color-white: ΔL 0.102 (median 0.321)
- **green** [step-evenness]: color-green-light → color-green-extra-light: ΔL 0.092 (median 0.206)
- **blue** [hue-drift]: color-blue → color-blue-light: Δh 17.5°
- **pink** [step-evenness]: color-pink-light → color-pink-extra-light: ΔL 0.062 (median 0.226)
- **yellow** [step-evenness]: color-yellow-light → color-yellow-extra-light: ΔL 0.050 (median 0.195)
- **cyan** [step-evenness]: color-cyan-dark → color-cyan: ΔL 0.078 (median 0.172)

## Thresholds

- WCAG AA: 4.5:1 text, 3:1 UI components
- APCA: flag Lc < 60 (text), < 45 (severe / UI)
- Auto-fix: OKLCH L nudge ≤ 0.06 on foreground token only
