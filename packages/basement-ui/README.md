# Basement UI

Design system and component library for Gwenzhir projects.

## Contents

- `src/tokens/` — Design tokens (colors, typography, measure, layout)
- `src/base/` — Reset and base element styles
- `src/typography/` — Heading, body, caption, mono, serif, emoji, link, and tabular-numeral styles
- `src/icons/` — Phosphor icon size utilities
- `src/components/` — Reusable UI component styles and optional JS helpers
- `src/patterns/` — Composition patterns (App frame, Edge fade) built on tokens and components
- `src/index.css` — Full library entry (imports all of the above)
- `reference/` — Reference page chrome (sidebar, demos, dev toggles); not part of the published package
- `index.html` — Live token and component reference
- `vendor/source-han/` — Typeface loading CSS: Inter, Pretendard, Source Han Serif, Roboto Mono, Noto Emoji (OFL)
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
<script src="path/to/basement-ui/src/components/keyboard.js" defer></script>
<script src="path/to/basement-ui/src/components/box-resize.js" defer></script>
<script src="path/to/basement-ui/src/components/edge-fade.js" defer></script>
<script src="path/to/basement-ui/src/components/panel.js" defer></script>
<script src="path/to/basement-ui/src/components/dialog.js" defer></script>
<script src="path/to/basement-ui/src/components/sheet.js" defer></script>
<script src="path/to/basement-ui/src/components/toast.js" defer></script>
<script src="path/to/basement-ui/src/components/float.js" defer></script>
<script src="path/to/basement-ui/src/components/dropdown.js" defer></script>
<script src="path/to/basement-ui/src/components/slider.js" defer></script>
<script src="path/to/basement-ui/src/components/datetime.js" defer></script>
<script src="path/to/basement-ui/src/components/tooltip.js" defer></script>
<script src="path/to/basement-ui/src/components/tabs-collapse.js" defer></script>
<script src="path/to/basement-ui/src/patterns/app-frame.js" defer></script>
<script src="path/to/basement-ui/src/components/timeline-axis.js" defer></script>
<script src="path/to/basement-ui/src/components/graph-density.js" defer></script>
```

| Script | API | Role |
|---|---|---|
| `theme.js` | `BasementTheme` | Mirrors `prefers-color-scheme` onto `html.is-dark`; wires `[data-theme-toggle]` and persists the choice |
| `keyboard.js` | `BasementKeyboard` | Return activates checkboxes, radios, and switches; pins the table wrap focus ring to the scrollport (other Tab rings ship in the CSS bundle) |
| `box-resize.js` | `BasementBox` | Drag handle for `.box--resizable` |
| `edge-fade.js` | `BasementEdgeFade` | Scroll-aware edge masks for tables/graphs/nav (skips Tabs; load before Panel) |
| `panel.js` | `BasementPanel` | Left/right panel resize + drawer toggle / close; closed drawers and blurred overlay UI are skipped in the tab order |
| `dialog.js` | `BasementDialog` | Centered modal; blurry overlay by default; plain panel option leaves the page clear and clickable; Guide type with Tabs, a rich body, and Close on the heading; Popup type for a one-time notice with close and Don’t show again; `data-overlay-dismiss` is `both` (default), `escape`, `backdrop`, or `none`; `data-dialog-static` keeps a sample from closing; inside `.overlay-root` the host covers that box; overlay UI is not focusable |
| `sheet.js` | `BasementSheet` | Bottom panel; content height by default, `.sheet--half` for half the page or root; scrolling body with pinned actions; same dismiss attribute; `data-sheet-static` keeps a sample from closing |
| `toast.js` | `BasementToast` | Transient status at the bottom center of the page, or of `.overlay-root`; inside `.chat` it stays in the room; `data-toast-duration` in ms, `0` stays until closed |
| `float.js` | `BasementFloat` | Portals Datetime / Tooltip / Dropdown / Tabs menus out of overflow parents; dialog re-places on page scroll; `align` is `start` (default), `end`, or `center`; `placement` is `bottom` (default), `end`, or `start` |
| `dropdown.js` | `BasementDropdown` | Trigger + Menu: `aria-expanded`, Escape, click-outside, arrow keys; uses Float when present |
| `slider.js` | `BasementSlider` | Single or dual-thumb range; paints the fill and ticks; keeps paired number fields and optional value labels in sync |
| `datetime.js` | `BasementDatetime` | Day and year-month pickers (uses Float when present) |
| `tooltip.js` | `BasementTooltip` | Hover/focus tips via Float |
| `tabs-collapse.js` | `BasementTabs` | Stack or Dropdown overflow (`data-tabs-overflow`; dropdown uses Float when present) |
| `app-frame.js` | `BasementFrame` | Sheet layout helpers; exclusive left/right Panel drawers |
| `timeline-axis.js` | `BasementTimeline` | Skip/span axis labels |
| `graph-density.js` | `BasementGraphDensity` | Compact labels + horizontal scroll for dense lines |

**Theme** — Load `theme.js` in `<head>`. Put `data-theme-toggle` on an icon button with Moon and Sun icons (see Button in the reference). Toggles `html.is-dark`, shows Moon in light and Sun in dark, and remembers the choice; until then it follows `prefers-color-scheme`.

**Tag** — Outline, filled, split, and compact labels. `.tag--counter` is a compact Gray XD count. One digit is square (Radius S) at every size; extra digits grow wider. Uses lining proportional digits. Defaults to 2XS; pair with a size class to scale.

**Box** — Lined panel (`.box`). Add `.box--resizable` plus a `.box-resize-handle` (or let `box-resize.js` inject one) to drag the end edge, or move a focused handle with the arrow keys. Clamps via `data-box-min-width` / `data-box-max-width` (`rem`, `px`, or `%` of the parent).

**Button** — `.btn` with size (`--3xs` / `--2xs` / `--xs` / `--s`) and type (`--default` / `--subtle` / `--accent` / `--ghost`). `.btn--icon` is square; `.btn--round` is circular. `.btn--float` pins a filled control above everything else (`position: fixed`, end-bottom, `z-index` above Dialog). Add a text label beside the icon; omit `.btn--accent` for a filled Default surface. Hover stays opaque (Gray Extra Light / Extra Dark), never alpha.

**Button group** — `.btn-group` joins buttons in a row; `.btn-group--column` stacks them. Shared outer radius, square inner corners, overlapping borders. Not a segmented choice — each control stays a Button.

**Rating** — `.rating-star` is a Gray outline star that turns theme foreground and filled on hover, active, or selected. `.rating` is a row of five; fill runs through the chosen (or hovered) star. CSS only — checkbox for one star, radios for five.

**Panel** — Left or right side chrome (`.panel--left` / `.panel--right`): bordered surface, optional `.panel--drawer` (left below 37.5rem host, right below 56.25rem) sliding to a defined width with translucent backdrop; add `.panel--drawer-full` for a host-covering drawer. Toggle via `data-panel-toggle`; a closed drawer is skipped in the tab order until the toggle is activated. While a drawer overlay is up, blurred UI behind it is not focusable. Optional `.panel--resizable` with an edge drag handle (arrow keys move a focused handle). Host with `.panel-host` (App frame is also a host).

**Dialog** — `.dialog-host` + `.dialog`. Default uses a blurry overlay. `.dialog-host--plain` omits the overlay so the page stays visible and clickable around the panel. `.dialog--guide` is a wider panel with Tabs and a scrolling rich body (Content Block, copy) for onboarding or help; put Close on `.dialog-heading`, outside the body, so it is not clipped. `.dialog--popup` is a one-time notice with a close control and a Don’t show again checkbox; apps persist the preference. `data-overlay-dismiss` is `both` (default), `escape`, `backdrop`, or `none`. `data-dialog-static` is `none` and also keeps the sample from closing. A direct child of `.overlay-root` covers that box instead of the page. Escape closes the topmost allowed surface in the focused region first, then on the page.

**Overlay root** — `.overlay-root` is a box the app sizes (`position: relative`, isolated, overflow hidden). It has no size of its own. Dialog, Sheet, and Toast hosts that are direct children cover only that box. Toasts sit above the content and do not block it. Sheet and Dialog share the next layer; a later sibling paints above an earlier one. An open modal makes the rest of the root inert.

**Sheet** — `.sheet-host` + `.sheet`, anchored to the bottom. Phone width (`23.4375rem`) and centered on a wide page; in an `.overlay-root` it fills the region with a full border and top-corner radius; the container clips the side and bottom borders so only the top edge shows, and the overlay is a flat scrim. Title is centered. `.sheet-actions` (and a `.btn-group` in the sheet) is a full-width button group. Content height hugs the content up to a cap that leaves a strip of the surface behind visible. `.sheet--half` is half the height of the page or overlay root. `.sheet-body` scrolls; `.sheet-heading` and `.sheet-actions` stay put. Closed, it takes no flow space. Same `data-overlay-dismiss` values as Dialog. `data-sheet-static` keeps a sample from closing. A page sheet moves to `document.body` while open so it covers the sidebar.

**Toast** — `.toast-host` + `.toast` (`role="status"`). A translucent Gray chip with white text, no border, and no shadow, in both themes. Pinned to the bottom center of the page, or of an overlay root. Inside `.chat` it stays in that room, above the composer or menu. The host does not block pointer events around the chip. `data-toast-duration` is milliseconds; `0` or omitting it leaves the toast up until the app closes it. `data-toast-close` may name a host id.

**Mockup** — `.mockup--phone` (23.4375rem × 50.75rem), `.mockup--tablet` (48rem × 64rem), `.mockup--desktop` (80rem × 45rem). `.mockup--landscape` swaps phone and tablet and insets the screen from the side borders; desktop stays a landscape window. Phone and tablet are a hairline frame with Radius L and a narrow bezel on the top and bottom — portrait screens stay flush with the side borders. Desktop uses Radius M and a 2rem title bar (`.mockup-bar` / `.mockup-title`). `.mockup-screen` is the slot; add `.overlay-root` so sheets, dialogs, and toasts stay on the screen. Content lays out at the logical size. `.mockup-stage` scales the frame down with `zoom` to fit a sized parent and never past 1:1. Grayscale and the sans base face; no device hardware. Control markers sit on the screen. `.control-marker--tap` is a translucent gray circle with no border that pulses in place. `.control-marker--drag` is the same circle: it fades in like the tap, then travels from the start to the end. Set `--x` and `--y` from 0 to 100 across and down the screen; a drag also sets `--x2` and `--y2`.

**App frame** — Composes left and right Panel around the sheet (`.app-frame`). Optional `.app-frame--nav` with `.app-frame-panes` puts a Nav bar above the panes so drawers stay under the bar. Drawers and resize come from Panel; backdrop is scoped to the pane host. In the right detail pane, wrap the title row and Tabs in `.panel-sticky` so the header under-fade sits below tab chrome (Tabs overflow is stack/dropdown, not horizontal scroll + fade).

**Dropdown** — `.dropdown` wraps a `.dropdown-trigger` and a `.menu` panel. Load `dropdown.js` after `float.js`. Placement: `dropdown--end` / `dropdown--center`, or `data-dropdown-align`. Side flyout: `dropdown--side` or `data-dropdown-placement="end"|"start"`. Sidebar items default to a side flyout. Tabs overflow builds its own control and is not auto-wired.

**Tooltip** — `.tooltip` with `.tooltip-content`. Placement: `.tooltip--top` / `--right` / `--bottom` / `--left`. Sizes `.tooltip--2xs` / `--xs` / `--s` / `--m` / `--l` (default 2XS) change type, padding, max width, and space between blocks. Copy uses compact leading (`.type-compact`: size + 0.25rem). Copy may include `strong` / `em`, `.code`, `.link`, compact Tags, and `ul` / `ol` (use a `div` for the tip when it contains a list). A long note can mix a title, several paragraphs, and a list — pair it with S, M, or L. The tip stays black-on-white so nested chrome does not follow the page theme. Load `tooltip.js` after `float.js` so a formatted tip stays open while the pointer moves onto a link.

**Slider** — `.slider` is a track with a draggable thumb. Add a second `.slider-input` (and `.slider--range`) for a min–max span. `.slider--stepped` draws tick marks from the input’s `min` / `max` / `step`; add `.slider--labels` for a value under each stop. Optional `.slider-value` shows the live number at the end. Load `slider.js` to paint the fill, ticks, and values; keep thumbs from crossing; and sync number fields inside `.filter-range` (and the Filter chip label when the slider is in a criterion). Click the track to jump the nearest thumb.

**Filter** — `.filter` is a wrapping row of criteria for lists and tables. Each `.filter-rule` is a Dropdown: property, operator, and value on the trigger, a small circular remove control inside the chip, and a Menu to edit. Omit `.filter-rule-remove` to keep a criterion; Clear leaves those in place and hides when nothing is removable. `.filter-rule--choices` lists options as joined buttons on the chip instead of a menu; the selected option uses `aria-pressed`. Value menus can be a single option, checkboxes (`data-dropdown-keep-open` so the menu stays open), a `.filter-range` of Slider plus number inputs, or Datetime duration. Criteria combine with And. Empty state shows Filter; with rules it shows Add filter and Clear. `.filter-add` with `.btn--icon` is a compact Add (Funnel when empty, Plus with rules). `.filter--list` stacks rows with a leading Where / And. `.filter-group` stacks a Filter above a Table. Remove and Clear are for apps to wire.

**Progress** — `.progress` is a track and fill. Set `--progress` to the fill amount. Optional `.progress-value` sits at the end of the track; `.progress-status` is a longer note under it. `.progress--stepped` is a row of equal segments, like a shorts paginator. Set `--progress` on each track: `100%` for a finished segment, a partial value for the current one, and leave it unset for upcoming segments.

**Spinner** — `.spinner` is a Gray L ring with an open gap. Sizes `.spinner--s` / `--m` / `--l` (default M). `.spinner--dots` is three smaller dots; the rest is a faint Gray and the lit dot turns foreground. Put a span inside for each dot.

**Chat rooms** — `.chat-rooms` is the conversation list (portrait, name, preview, time, optional unread Tag). It hugs its columns (XS inline padding, `max-content` width). Optional `.chat-room-group` / `.chat-room-label` cluster rooms; a leading `.checkbox` then `.rating-star` select and star. A checked room uses the same highlight as `.is-active`. When a room has those controls, the row is a `div`, `.chat-room-main` opens the thread, and the line is name, optional label, time, then optional unread counter.

**Messages** — `.chat` is a thread: header and a scrollable log. Messages use Avatar, name, time, and body; `.chat-message--follow` hides the portrait and name for a run from the same person; `.chat-message--self` places the portrait, name, and time on the trailing edge. In Bubble, outgoing notes use a filled foreground surface and background text; incoming notes keep the bordered surface. `.chat--bubble` wraps every note in a surface. `.chat-typing` is a log row that holds a Dots spinner (`aria-label` on the row names who is typing). An empty log uses `.chat-empty`. A rich note is a `.chat-card` (optional `.chat-card-media` or centered `.chat-card-mark`, title, copy, optional Pairs, `.chat-card-actions` stacked or `.chat-card-actions--row`). `.chat-menu` is a panel pinned to the bottom of `.chat`, not a message. `.chat-menu-list` is full-width text rows with no icons. `.chat-menu-grid` is a rich menu (icon over label): three columns by default, `.chat-menu-grid--1` for one column, one or two rows; items past that are not shown. `.chat-menu` has a full border and top-corner radius; the chat clips the side and bottom borders so the toggle shows a rounded top. `.chat-menu-toggle` is a short full-width bar; it reads Menu unless the app sets another label. `.is-collapsed` hides the body and leaves that toggle. A `.toast-host` in the room sits at the bottom center, above the composer or the menu. A rich note is a little narrower than the message column.

**Composition** — `.chat-composer` is the field under a thread (Text Input + Button). `.chat-suggestions` is a wrapping row of short reply chips above that field; apps choose the words from context. `.chat-frame` places Chat rooms beside a thread. Chrome only — apps own sending and delivery.

**Activity** — `.activity` is a feed of events and notifications. Each `.activity-item` is a row: leading Avatar or `.activity-icon`, actor plus action, time, optional preview, optional unread dot. `.is-unread` uses the same highlight as a current Chat room. `.activity-group` / `.activity-group-label` cluster by day. `.activity--compact` tightens padding. Nested in a Menu (bell dropdown) the list drops its own frame. Chrome only — apps own delivery. Click-to-read is for apps to wire.

**Profile** — `.profile-item` pairs Avatar with a name and an optional second-line `.profile-item-meta`. Sizes `.profile-item--xs` / `--s` / `--m` / `--l` (default XS) change padding only; Avatar size is independent. With meta or a Tag, use a larger Avatar by default. A Tag on the meta line keeps the same line height as plain meta.

**Sidebar** — Vertical nav (`.sidebar` / `.sidebar-nav`). Wrap a `.sidebar-item` trigger in Dropdown for sub-menus; the Menu portals above the sidebar clip. `.sidebar-item--fixed` is a child of `.sidebar` (not the scrolling nav): it sits below the list at the bottom, with Default button surface and border. `.sidebar-profile` is a pinned `.box` wrapping a Profile item; place it above the nav (after the title) so it stays put while the list scrolls. XS snaps to item icons and labels; S / M / L keep Profile spacing. Load `edge-fade.js` so the nav fades at clipped edges.

**Menu** — Compact action list (`.menu` / `.menu-item`), or organized variant `.menu--mega` with `.menu-grid--2` / `--3`, `.menu-section` headings, and items that can take a short description, icon, external mark, or an avatar and username (My menu). Open either from a Dropdown.

**Nav bar** — Horizontal product chrome (`.navbar`): `.navbar-brand` (Phosphor mark + name), `.navbar-nav` items, optional Dropdown + Menu per item, and `.navbar-end` for icon-only search and notifications plus the account cluster. `.navbar--compact` tightens bar and item padding; its start inset matches a left Panel sidebar so brand and items line up.

**Footer** — Quiet page-end row (`.footer`): `.footer-copy` then `.footer-nav` links, sitting together. 2XS, secondary color. `.footer--border` adds a hairline on top; `.footer--between` puts copy on the start and links on the end. Links have no underline; they pick up the theme foreground on hover. CSS only.

**Tabs** — `.tabs` / `.tab`. Default hugs its pages. `.tabs--full` is the full-width type: equal pages fill the available width. Default uses XS type to match Filter and Button. `.tabs--s` uses S type.

**Tabs overflow** — default stacks into a vertical list when labels exceed the parent width. Use `data-tabs-overflow="dropdown"` for a Dropdown + Menu control (uses Float when present; put `data-float-boundary` on a nearer frame to clamp there instead of the viewport), or `"off"` / `data-tabs-collapse="off"` to opt out. Force stacked with `tabs--stacked`. Do not put scroll edge fades on Tabs.

**Tabular numerals** — add `.tnum` on the base face for equal-width digits (amounts, ISO dates, counts). Prefer this over Mono for dense numeric UI.

**Typefaces** — Base text is Inter over Pretendard at weight 500. Pretendard Hangul loads slightly larger (`size-adjust: 103%`) so it optically matches Inter Latin/numerals in mixed runs. Serif is Source Han Serif at 600 (`type-serif`), loaded slightly smaller than Sans (`size-adjust: 94%`). Mono is Roboto Mono over Pretendard (`type-mono`), slightly smaller (`size-adjust: 97%`) with letter spacing −0.01em. Emoji is Noto Emoji (`type-emoji`): monochrome and tintable with text color. `.type-emoji` sets `font-variant-emoji: text`; avoid `U+FE0F` in content (use `U+FE0E` or bare codepoints) or browsers will prefer system color emoji. Noto Emoji is also listed after each family so emoji codepoints resolve there via unicode-range subsets. Load `vendor/source-han/fonts.css` in every project so the faces resolve; it declares faces with absolute CDN URLs and `font-display: block` (no nested `@import`, no fallback flash). Preload Inter and Pretendard WOFF2s in `<head>` when possible. Phosphor regular weight is vendored as WOFF2 at `vendor/phosphor/regular/`.

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

The default look is grayscale and sans-serif. Importing the library sets the page background, foreground, and `--font-base-family` (Inter, then Pretendard, then `sans-serif`). Accent is black in light mode and white in dark mode. Apps do not add CSS or retoken to stay on that default. Affirm, warn, destructive, graph hues, serif, and mono are opt-in on the element that needs them.

## License

ISC for Basement UI. Typefaces are SIL OFL 1.1 (Inter, Pretendard, Source Han Serif, Roboto Mono, Noto Emoji); see `vendor/source-han/NOTICE`. [Phosphor Icons](https://phosphoricons.com/) are MIT; see `vendor/phosphor/NOTICE`.
