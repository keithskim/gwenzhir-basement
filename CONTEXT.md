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
- **Colors** — 5 grayscale steps (Black `#111111` → White `#FFFFFF`) + 3 hues × 3 shades each: Red (`#8B0000` / `#EE3333` / `#FFE8E8`), Green (`#1A5C28` / `#33BB55` / `#E0F8E8`), Blue (`#1A2E6E` / `#3366EE` / `#E0EAFF`)
- **Typography** — Base Text: Pretendard 600. Six sizes XS–2XL (0.75–4rem). Line height = font-size + 0.5rem throughout.
- **Border radius** — S `0.25rem` (default), M `0.5rem`, L `1rem`
- **Spacing** — XS–XL: 0.5 / 1 / 2 / 4 / 8rem (2× steps)
- **Sizes** — XS–XL: 1 / 2 / 4 / 8 / 16rem (2× steps)

**Reference page sections:**
- **Colors > Palette** — grayscale row + hue rows (Red, Green, Blue) each with Dark / Mid / Light swatches
- **Colors > Scheme** — assigns Light and Dark theme colors to 6 roles grouped by Background, Text, Border; roles are clickable to swap color from the full palette
- **Typography** — Typeface, Sizes, Headings (H1–H4), Body (paragraph, blockquote), Caption, Links
- **Borders** — Radius, Color (light/dark context), Divider
- **Spacing** — rising bars visualization
- **Sizes** — bottom-aligned squares visualization

**Design principles:**
- Tokens are the source of truth — components reference tokens, not raw values
- All values in rem
- No all-caps or non-standard letter-spacing in UI text
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
