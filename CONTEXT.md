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
- **Colors** — 5 grayscale steps (Black `#111111` → White `#FFFFFF`) + 3 hues × 3 shades each: Red (`#7A1000` / `#EF3D28` / `#FFEBE6`), Green (`#133D22` / `#33BB55` / `#E0F8E8`), Blue (`#0F1848` / `#3366EE` / `#E0EAFF`)
- **Typography** — Base Text: Pretendard 600. Six sizes XS–2XL (0.75–4rem). Line height = font-size + 0.5rem throughout.
- **Measure** — Border radius S `0.25rem` (default), M `0.5rem`, L `1rem`; spacing XS–XL: 0.5 / 1 / 2 / 4 / 8rem (2× steps); sizes XS–XL: 1 / 2 / 4 / 8 / 16rem (2× steps)
- **Layout** — Viewports Narrow (&lt; 30rem), Medium (≥ 30rem), Wide (≥ 60rem), Extra wide (≥ 90rem); maximum viewport 120rem (layout caps and left-aligns beyond that); page column count 3 / 5 / 7 / 9; sidebar spans 1 / 2 / 2 / 2; content fills 2 / 3 / 5 / 7; 1rem gap between all columns

**Reference page sections:**
- **Colors > Palette** — grayscale row + hue rows (Red, Green, Blue) each with Dark / Mid / Light swatches
- **Colors > Scheme** — assigns Light and Dark theme colors to 6 roles grouped by Background, Text, Border (h4 headings); roles are clickable to swap color from the full palette
- **Typography** — Typeface, Sizes, Headings (H1–H4), Body (paragraph, blockquote), Caption, Links
- **Measure** — Radius, Divider, Spacing (rising bars), Sizes (bottom-aligned squares)
- **Layout** — Columns (one row per viewport in a shared sample box), Viewport (GANTT-style swimlanes on a proportional scale)

**Design principles:**
- Tokens are the source of truth — components reference tokens, not raw values
- All values in rem
- No all-caps or non-standard letter-spacing in UI text
- Subsection headings omit a bottom border when immediately followed by a full-width bordered box
- The token reference page uses a page-wide layout column grid; sidebar and main content occupy fixed column spans; a dev overlay (on by default) shows columns as translucent red bands, toggled with a Show columns checkbox in the sidebar
- Components should be composable and unstyled-first where possible
- Minimal external dependencies

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
