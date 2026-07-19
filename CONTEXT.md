# Gwenzhir Basement

A base layer of shared styles, components, and internal tools used across Gwenzhir projects.

## Purpose

Basement exists to prevent reinventing the wheel across projects. It provides a consistent design foundation (tokens, components) and a place to manage project-level information without scattering it across different tools.

## Structure

```
Gwenzhir Basement/
├── packages/               # Shared libraries consumed by apps and other projects
│   └── basement-ui/        # Design system: tokens, components, typography
├── apps/                   # Standalone tools built on top of packages
│   └── basement-projects/  # Internal project management log
└── docs/                   # Decisions, research, reference material
```

New tools go in `apps/`. New shared libraries go in `packages/`.

---

## Tools

### Basement UI (`packages/basement-ui`)

A project-agnostic component library and design system for use in internal tools, admin interfaces, and other Gwenzhir projects.

The live token reference is at `packages/basement-ui/index.html`. It documents and demonstrates the full token set using only the tokens it defines.

**Current token set:**
- **Colors** — 5 grayscale steps + 6 hues × 5 shades each (Extra Dark · Dark · Mid · Light · Extra Light); grayscale is a mild yellow-green (modest chroma), with hue-specific twists (yellow darkens toward orange, cyan darkens toward teal, blue lightens toward cyan). Red (`#641400` · `#BC3618` · `#EC5844` · `#FFAA88` · `#FFF4EC`), Green (`#10301A` · `#237038` · `#289448` · `#ACEBC4` · `#F0FCF2`), Blue (`#0A1338` · `#1F3F9B` · `#406CE6` · `#A8D4FF` · `#F2F8FC`), Pink (`#46124C` · `#A44C9C` · `#DE64C6` · `#F8D4F6` · `#FEF2F9`), Yellow (`#4E3000` · `#8A6600` · `#E0C008` · `#FFEB80` · `#FFFAE8`), Cyan (`#045458` · `#089898` · `#0AB0C4` · `#84E4F4` · `#EAF6FA`); grayscale `#131410` · `#222320` · `#65685F` · `#898D83` · `#DEDFD8` · `#F6F6F1` · `#FFFFF9`
- **Palette audit** — `npm run audit:colors` in `packages/basement-ui` scores WCAG 2.x AA (body text 4.5:1, large/UI 3:1), APCA Lc, and OKLCH ramp health; `npm run audit:colors:fix` nudges failing foreground tokens in OKLCH (max ΔL 0.06, max ΔC 0.02). Light-mode semantic borders on white/XL tints are structural (subtle by design, exempt). Report: `packages/basement-ui/scripts/palette-audit-report.md`. Last run 2026-06-15: 0 WCAG failures.
- **Typography** — Base Text: Pretendard 600. Six sizes XS–2XL (0.75–4rem). Line height = font-size + 0.5rem throughout.
- **Measure** — Border radius S `0.25rem` (default), M `0.5rem`, L `1rem`; spacing XS–XL: 0.5 / 1 / 2 / 4 / 8rem (2× steps); sizes XS–XL: 1 / 2 / 4 / 8 / 16rem (2× steps)
- **Layout** — Viewports Narrow (&lt; 40rem), Medium (≥ 40rem), Wide (≥ 80rem), Extra wide (≥ 120rem); maximum viewport 160rem (layout caps and left-aligns beyond that); page column count 7 / 9 / 11 / 13; narrow sidebar is overlay (0 columns reserved, content uses all 7); from medium up sidebar spans 2 and content fills 7 / 9 / 11; 1rem gap between all columns; page vertical padding 1rem
- **Icons** — [Phosphor Icons](https://phosphoricons.com/) regular weight (MIT), vendored at `packages/basement-ui/vendor/phosphor/regular/`; sizes S / M / L at 0.75 / 1 / 1.25rem (default M); sized with `font-size`

**Reference page sections:**
- **Foundation** — Colors, Typography, Measure, Layout, Icons
- **Components** — Button (Default, Subtle, Accent, Ghost, Icon only, With icon; 2XS / XS / S; optional trailing tag for shortcuts; tighter end padding after trailing tag or icon), Tabs (subtle grouped controls, minimal underline, optional equal-width fill), Toggle (horizontal toggle, checkbox, radio button, segmented select), Text Input (default, invisible inline editing, search, attached actions, textarea), Form (Input, Label, Textarea, Checkbox, Radio, Switch), Graph (Bar: vertical and horizontal; muted and accent fills; bar label and value outside by default, each optionally inside; minimalist grid), Tag (default, filled, split, compact; 2XS / XS / S / M), Status Chip, Progress (optional value; fill amount via custom property), Player (Default audio: play control, scrubber, elapsed and duration), Avatar, Dropdown, Table (header, sortable columns, plain rows by default, optional striped rows, optional selectable rows with hover), Sidebar (default, compact; menu items with count or icon and label), Alert (Neutral, Affirm, Warn, Destructive)
- **Colors > Palette** — grayscale row + full-width hue rows (Red, Green, Blue, Pink, Yellow, Cyan) each with Extra Dark / Dark / Mid / Light / Extra Light swatches
- **Colors > Scheme** — assigns Light and Dark theme colors to roles grouped by Background (Primary, Secondary, Neutral, Affirm, Warn, Destructive), Text (Primary, Secondary, Affirm, Warn, Destructive), and Border (Resting, Highlighted, Affirm, Warn, Destructive); roles are clickable to swap color from the full palette. Semantic tinted backgrounds use each hue's extra-light shade in light mode and extra-dark in dark mode; semantic text uses each hue's dark shade in light mode and light shade in dark mode; semantic borders use each hue's light shade in light mode and dark shade in dark mode. Alerts reference the same background, text, and border tokens.
- **Typography** — Typeface, Sizes, Headings (H1–H4), Body (paragraph S / M, quote S / M), Semantic text (Affirm, Warn, Destructive), Caption, Links
- **Measure** — Radius, Divider, Spacing (rising bars), Sizes (bottom-aligned squares)
- **Layout** — Columns (one row per viewport in a shared sample box), Viewport (GANTT-style swimlanes on a proportional scale)
- **Icons > Sizes** — S / M / L gear samples with Phosphor attribution; **Icons > Icons** — grouped catalog (~100 icons: Navigation, Actions, Account & settings, Content & communication)

**Design principles:**
- Tokens are the source of truth — components reference tokens, not raw values; the reference page uses only colors from the defined palette (35 swatches + theme roles), never ad-hoc hex values
- Middle dot (`·`) is the in-text list separator; size pairs use `·` not `/`
- All values in rem
- No all-caps or non-standard letter-spacing in UI text
- Subsection headings omit a bottom border when immediately followed by a full-width bordered box
- In a sample list, items shown side by side in the same row must share equal sample-box height (subgrid row tracks); meta labels sit in a second row with `--spacing-xs` gap below each box
- Component sample lists snap to the column grid: full width below 80rem, 2-column cells at wide and above; compact demos (Button sizes, Tag, Avatar, Form controls) center content in sample boxes with a 2:1 aspect ratio at wide viewports
- The token reference page uses a page-wide layout column grid; sidebar and main content occupy fixed column spans; a dev overlay (on by default) shows columns as translucent red bands, toggled with a Show columns checkbox in the sidebar
- Components should be composable and unstyled-first where possible
- Icon set is the only current external dependency; Phosphor regular weight is vendored so the reference page works without a build step

---

### Basement Projects (`apps/basement-projects`)

An internal project management log for tracking major Gwenzhir projects.

**Scope:**
- A record of active and past projects
- Per-project metadata: description, status, where data lives, key contacts
- Important dates, agreements, schedules, and obligations
- Links to external resources (repos, drives, contracts, etc.)

**Design principles:**
- Simple and fast to update — friction here means it won't get used
- Read-optimized: easy to scan at a glance
- No complex workflows; this is a log, not a PM platform

---

## Adding a New Tool

1. Decide whether it's a **library** (goes in `packages/`) or an **app** (goes in `apps/`)
2. Create the directory and add a brief README covering its purpose and scope
3. Update this file under the **Tools** section

## Conventions

- Tools should document their own scope boundaries so it's clear what belongs where
- Prefer building on Basement UI rather than shipping bespoke styles per app
- Keep `docs/` for decisions and research, not ephemeral notes
