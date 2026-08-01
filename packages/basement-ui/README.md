# Basement UI

Design system and component library for Gwenzhir projects.

## Contents

- `src/tokens/` — Design tokens (colors, typography, measure, layout)
- `src/base/` — Reset and base element styles
- `src/typography/` — Heading, body, caption, and link styles
- `src/icons/` — Phosphor icon size utilities
- `src/components/` — Reusable UI component styles (Button, Tabs, Toggle, Text Input, Form, Graph, Tag, Status Chip, Pairs, Content Block, Progress, Spinner, Player, Avatar, Menu, Dropdown, Tooltip, Datetime, Sidebar, Prompt, Alert, Table, Timeline, Calendar)
- `src/index.css` — Full library entry (imports all of the above)
- `reference/` — Reference page chrome (sidebar, demos, dev toggles); not part of the published package
- `index.html` — Live token and component reference
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

Link the full library:

```html
<link rel="stylesheet" href="path/to/basement-ui/src/index.css">
<link rel="stylesheet" href="path/to/basement-ui/vendor/phosphor/regular/style.css">
```

Or import subsets via package exports:

```html
<link rel="stylesheet" href="path/to/basement-ui/src/tokens/tokens.css">
<link rel="stylesheet" href="path/to/basement-ui/src/components/index.css">
```

For Tabs that should collapse into a vertical list when labels exceed the container:

```html
<script src="path/to/basement-ui/src/components/tabs-collapse.js" defer></script>
```

Force stacked with `tabs--stacked`, or opt out with `data-tabs-collapse="off"`.

Load Pretendard separately (CDN or self-hosted). Phosphor regular weight is vendored as WOFF2 at `vendor/phosphor/regular/`.

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

ISC for Basement UI. [Phosphor Icons](https://phosphoricons.com/) are MIT; see `vendor/phosphor/NOTICE`.
