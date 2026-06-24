# Basement UI

Design system and component library for Gwenzhir projects.

## Contents

- `src/tokens/` — Design tokens (colors, typography, measure, layout)
- `src/base/` — Reset and base element styles
- `src/typography/` — Heading, body, caption, and link styles
- `src/icons/` — Phosphor icon size utilities
- `src/components/` — Reusable UI component styles (Button, Form, Tag, Avatar, Dropdown, Alert, Table, Sidebar)
- `src/index.css` — Full library entry (imports all of the above)
- `reference/` — Reference page chrome (sidebar, demos, dev toggles)
- `index.html` — Live token and component reference

## Usage

### Reference page

Open `index.html` in a browser, or run a local server:

```bash
npm run dev
```

Then visit http://localhost:5173

### Import into an app

Link the full library:

```html
<link rel="stylesheet" href="path/to/basement-ui/src/index.css">
<link rel="stylesheet" href="path/to/basement-ui/vendor/phosphor/regular/style.css">
```

Or import subsets via npm package exports:

```html
<link rel="stylesheet" href="path/to/basement-ui/src/tokens/tokens.css">
<link rel="stylesheet" href="path/to/basement-ui/src/components/index.css">
```

Load Pretendard separately (CDN or self-hosted). Phosphor regular weight is vendored at `vendor/phosphor/regular/`.

## Intended use

Import tokens and components into any Gwenzhir app or internal tool. Do not add application-specific logic here — this package has no opinion about routing, auth, or data fetching.
