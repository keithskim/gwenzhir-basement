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

**Scope:**
- Design tokens: color palette, typography scale, spacing, and other base variables
- UI components: buttons, inputs, layout primitives, etc.
- No opinions about routing, data fetching, or backend concerns

**Design principles:**
- Tokens are the source of truth — components reference tokens, not raw values
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
