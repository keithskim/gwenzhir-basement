# Basement UI

Design system and component library for Gwenzhir projects.

## Contents

- `src/tokens/` — Design tokens (colors, typography, measure, layout)
- `src/base/` — Reset and base element styles
- `src/typography/` — Heading, body, caption, mono, serif, link, and tabular-numeral styles
- `src/icons/` — Phosphor icon size utilities
- `src/components/` — Reusable UI component styles and optional JS helpers
- `src/patterns/` — Composition patterns (App frame, Edge fade) built on tokens and components
- `src/index.css` — Full library entry (imports all of the above)
- `reference/` — Reference page chrome (sidebar, demos, dev toggles); not part of the published package
- `index.html` — Live token and component reference
- `vendor/source-han/` — Typeface loading CSS: Inter, Pretendard, Source Han Serif, Roboto Mono (OFL)
- `vendor/phosphor/` — Phosphor Icons regular weight (MIT)

## Usage

### Reference page

Open `index.html` in a browser, or run a local server:

```bash
npm install
npm run dev
```

Then visit http://localhost:5173

### Import into an app

Link fonts, then the full library:

```html
<link rel="stylesheet" href="path/to/basement-ui/vendor/source-han/fonts.css">
<link rel="stylesheet" href="path/to/basement-ui/vendor/phosphor/regular/style.css">
<link rel="stylesheet" href="path/to/basement-ui/src/index.css">
```

Or import subsets via package exports:

```html
<link rel="stylesheet" href="path/to/basement-ui/src/tokens/tokens.css">
<link rel="stylesheet" href="path/to/basement-ui/src/components/index.css">
```

### Scripts

Optional IIFE helpers expose `window.Basement*` APIs. Load order matters for float consumers:

```html
<script src="path/to/basement-ui/src/components/theme.js"></script> <!-- early in <head> to avoid FOUC -->
…
<script src="path/to/basement-ui/src/components/box-resize.js" defer></script>
<script src="path/to/basement-ui/src/components/edge-fade.js" defer></script>
<script src="path/to/basement-ui/src/components/panel.js" defer></script>
<script src="path/to/basement-ui/src/components/float.js" defer></script>
<script src="path/to/basement-ui/src/components/datetime.js" defer></script>
<script src="path/to/basement-ui/src/components/tooltip.js" defer></script>
<script src="path/to/basement-ui/src/components/tabs-collapse.js" defer></script>
<script src="path/to/basement-ui/src/patterns/app-frame.js" defer></script>
<script src="path/to/basement-ui/src/components/timeline-axis.js" defer></script>
<script src="path/to/basement-ui/src/components/graph-density.js" defer></script>
```

| Script | API | Role |
|---|---|---|
| `theme.js` | `BasementTheme` | Mirrors `prefers-color-scheme` onto `html.is-dark` |
| `box-resize.js` | `BasementBox` | Drag handle for `.box--resizable` |
| `edge-fade.js` | `BasementEdgeFade` | Scroll-aware edge masks for tables/graphs/nav (skips Tabs; load before Panel) |
| `panel.js` | `BasementPanel` | Left/right panel resize + drawer toggle / close; wires nav edge fade |
| `float.js` | `BasementFloat` | Portals Datetime / Tooltip / Tabs menus out of overflow parents; dialog re-places on page scroll |
| `datetime.js` | `BasementDatetime` | Day and year-month pickers (uses Float when present) |
| `tooltip.js` | `BasementTooltip` | Hover/focus tips via Float |
| `tabs-collapse.js` | `BasementTabs` | Stack or Dropdown overflow (`data-tabs-overflow`; dropdown uses Float when present) |
| `app-frame.js` | `BasementFrame` | Sheet layout helpers; exclusive left/right Panel drawers |
| `timeline-axis.js` | `BasementTimeline` | Skip/span axis labels |
| `graph-density.js` | `BasementGraphDensity` | Compact labels + horizontal scroll for dense lines |

**Box** — Lined panel (`.box`). Add `.box--resizable` plus a `.box-resize-handle` (or let `box-resize.js` inject one) to drag the end edge. Clamps via `data-box-min-width` / `data-box-max-width` (`rem`, `px`, or `%` of the parent).

**Panel** — Left or right side chrome (`.panel--left` / `.panel--right`): bordered surface, optional `.panel--drawer` (left below 37.5rem host, right below 56.25rem) sliding to a defined width with translucent backdrop; add `.panel--drawer-full` for a host-covering drawer. Toggle via `data-panel-toggle`; optional `.panel--resizable` with an edge drag handle. Host with `.panel-host` (App frame is also a host).

**App frame** — Composes left and right Panel around the sheet (`.app-frame`). Drawers and resize come from Panel; backdrop is scoped to the frame. In the right detail pane, wrap the title row and Tabs in `.panel-sticky` so the header under-fade sits below tab chrome (Tabs overflow is stack/dropdown, not horizontal scroll + fade).
**Tabs overflow** — default stacks into a vertical list when labels exceed the parent width. Use `data-tabs-overflow="dropdown"` for a Dropdown + Menu control (uses Float when present; put `data-float-boundary` on a nearer frame to clamp there instead of the viewport), or `"off"` / `data-tabs-collapse="off"` to opt out. Force stacked with `tabs--stacked`. Do not put scroll edge fades on Tabs.

**Tabular numerals** — add `.tnum` on the base face for equal-width digits (amounts, ISO dates, counts). Prefer this over Mono for dense numeric UI.

**Typefaces** — Base text is Inter over Pretendard at weight 500. Serif is Source Han Serif at 600 (`type-serif`), loaded slightly smaller than Sans (`size-adjust: 94%`). Mono is Roboto Mono over Pretendard (`type-mono`), slightly smaller (`size-adjust: 97%`) with letter spacing −0.01em. Load `vendor/source-han/fonts.css` in every project so the faces resolve. Phosphor regular weight is vendored as WOFF2 at `vendor/phosphor/regular/`.

### Palette audit

```bash
npm run audit:colors
npm run audit:colors:fix
```

Translucent (`-a`) tokens match each solid color when composited over the page background (white in light mode, black in dark mode). Regenerate them after solid palette edits:

```bash
npm run generate:alpha
```

Area fills use the translucent tokens so they layer over tinted rows, chips, and hover states instead of masking them: `--theme-bg-subtle`, `--theme-bg-affirm`, `--theme-bg-warn`, `--theme-bg-destructive`, button hover fills, and graph bar fills. Opaque surfaces stay solid — `--theme-bg`, `--theme-surface`, and floating panels such as tooltips must occlude whatever is behind them.

## Intended use

Import tokens and components into any Gwenzhir app or internal tool. Do not add application-specific logic here — this package has no opinion about routing, auth, or data fetching.

## License

ISC for Basement UI. Typefaces are SIL OFL 1.1 (Inter, Pretendard, Source Han Serif, Roboto Mono); see `vendor/source-han/NOTICE`. [Phosphor Icons](https://phosphoricons.com/) are MIT; see `vendor/phosphor/NOTICE`.
