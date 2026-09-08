# AGENTS.md

## Cursor Cloud specific instructions

Gwenzhir Basement is a monorepo. The only runnable project today is the
`packages/basement-ui` design system; `apps/basement-projects` is a README-only
placeholder with no code yet.

### Basement UI (`packages/basement-ui`)

A zero-build-step, static CSS design system with a live reference page
(`index.html`) that links `src/` CSS modules, `reference/` chrome, and the
vendored Phosphor icon font. Node dependencies are only needed for the palette
audit script.

- Run dev server: `npm run dev` (serves the reference page at
  http://localhost:5173 via `npx serve`). This is the primary "app".
- Lint/check: `npm run audit:colors` (WCAG/APCA/OKLCH palette audit). This is
  the closest thing to a lint step. Running it rewrites
  `scripts/palette-audit-report.md` with the current date — that regeneration is
  an expected side effect, not a source change to commit.
- Auto-fix palette foregrounds: `npm run audit:colors:fix`.
- There is no real test suite; `npm test` is a placeholder that exits 1.

Notes:

- Commands must be run from `packages/basement-ui` (scripts and `serve` resolve
  paths relative to that directory).
- The reference page pulls the Pretendard font from a CDN; other assets (CSS,
  Phosphor font) are local, so the page renders fine offline aside from the
  webfont.
