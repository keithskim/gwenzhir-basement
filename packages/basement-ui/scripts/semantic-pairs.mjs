/**
 * Semantic foreground/background pairs to audit per theme mode.
 * fg/bg keys match theme token names (resolved to --color-* in audit-palette.mjs).
 *
 * minRatio: WCAG 2.x — 4.5 for body text, 3 for UI (borders, icons).
 * type: 'text' | 'ui' — used for APCA severity thresholds (60 / 45).
 */

export const THEME_LIGHT = {
  'theme-bg': 'color-white',
  'theme-fg': 'color-black',
  'theme-fg-secondary': 'color-gray',
  'theme-fg-body': 'color-dark-gray',
  'theme-fg-affirm': 'color-green-dark',
  'theme-fg-warn': 'color-yellow-dark',
  'theme-fg-destructive': 'color-red-dark',
  'theme-border': 'color-light-gray',
  'theme-border-affirm': 'color-green-light',
  'theme-border-warn': 'color-yellow-light',
  'theme-border-destructive': 'color-red-light',
  'theme-surface': 'color-white',
  'theme-bg-neutral': 'color-white',
  'theme-bg-affirm': 'color-green-extra-light',
  'theme-bg-warn': 'color-yellow-extra-light',
  'theme-bg-destructive': 'color-red-extra-light',
  'theme-bg-subtle': 'color-gray-extra-light',
};

export const THEME_DARK = {
  'theme-bg': 'color-black',
  'theme-fg': 'color-white',
  'theme-fg-secondary': 'color-light-gray',
  'theme-fg-body': 'color-light-gray',
  'theme-fg-affirm': 'color-green-light',
  'theme-fg-warn': 'color-yellow-light',
  'theme-fg-destructive': 'color-red-light',
  'theme-border': 'color-dark-gray',
  'theme-border-affirm': 'color-green-dark',
  'theme-border-warn': 'color-yellow-dark',
  'theme-border-destructive': 'color-red-dark',
  'theme-surface': 'color-black',
  'theme-bg-neutral': 'color-black',
  'theme-bg-affirm': 'color-green-extra-dark',
  'theme-bg-warn': 'color-yellow-extra-dark',
  'theme-bg-destructive': 'color-red-extra-dark',
  'theme-bg-subtle': 'color-gray-extra-dark',
};

/** @typedef {{ label: string, fg: string, bg: string, minRatio: number, type: 'text' | 'ui' }} SemanticPair */

/** @type {SemanticPair[]} */
export const SEMANTIC_PAIRS = [
  // Core text
  { label: 'Primary text', fg: 'theme-fg', bg: 'theme-bg', minRatio: 4.5, type: 'text' },
  { label: 'Body text', fg: 'theme-fg-body', bg: 'theme-bg', minRatio: 4.5, type: 'text' },
  { label: 'Secondary text', fg: 'theme-fg-secondary', bg: 'theme-bg', minRatio: 4.5, type: 'text' },

  // Semantic text on page bg
  { label: 'Affirm text on page', fg: 'theme-fg-affirm', bg: 'theme-bg', minRatio: 4.5, type: 'text' },
  { label: 'Warn text on page', fg: 'theme-fg-warn', bg: 'theme-bg', minRatio: 4.5, type: 'text' },
  { label: 'Destructive text on page', fg: 'theme-fg-destructive', bg: 'theme-bg', minRatio: 4.5, type: 'text' },

  // Semantic text on tinted bg
  { label: 'Affirm text on affirm bg', fg: 'theme-fg-affirm', bg: 'theme-bg-affirm', minRatio: 4.5, type: 'text' },
  { label: 'Warn text on warn bg', fg: 'theme-fg-warn', bg: 'theme-bg-warn', minRatio: 4.5, type: 'text' },
  { label: 'Destructive text on destructive bg', fg: 'theme-fg-destructive', bg: 'theme-bg-destructive', minRatio: 4.5, type: 'text' },

  // Borders on page bg (light mode uses L shades — intentionally subtle; structural)
  { label: 'Resting border on page', fg: 'theme-border', bg: 'theme-bg', minRatio: 3, type: 'ui', structural: true },
  { label: 'Affirm border on page', fg: 'theme-border-affirm', bg: 'theme-bg', minRatio: 3, type: 'ui', structural: true },
  { label: 'Warn border on page', fg: 'theme-border-warn', bg: 'theme-bg', minRatio: 3, type: 'ui', structural: true },
  { label: 'Destructive border on page', fg: 'theme-border-destructive', bg: 'theme-bg', minRatio: 3, type: 'ui', structural: true },

  // Borders on tinted bg (L on XL in light; D on XD in dark — structural)
  { label: 'Affirm border on affirm bg', fg: 'theme-border-affirm', bg: 'theme-bg-affirm', minRatio: 3, type: 'ui', structural: true },
  { label: 'Warn border on warn bg', fg: 'theme-border-warn', bg: 'theme-bg-warn', minRatio: 3, type: 'ui', structural: true },
  { label: 'Destructive border on destructive bg', fg: 'theme-border-destructive', bg: 'theme-bg-destructive', minRatio: 3, type: 'ui', structural: true },

  // Alerts — neutral
  { label: 'Alert neutral text', fg: 'theme-fg-body', bg: 'theme-bg-neutral', minRatio: 4.5, type: 'text' },
  { label: 'Alert neutral border', fg: 'theme-border', bg: 'theme-bg-neutral', minRatio: 3, type: 'ui', structural: true },
  { label: 'Alert neutral icon', fg: 'theme-fg', bg: 'theme-bg-neutral', minRatio: 3, type: 'ui' },

  // Alerts — affirm
  { label: 'Alert affirm text', fg: 'theme-fg-affirm', bg: 'theme-bg-affirm', minRatio: 4.5, type: 'text' },
  { label: 'Alert affirm border', fg: 'theme-border-affirm', bg: 'theme-bg-affirm', minRatio: 3, type: 'ui', structural: true },
  { label: 'Alert affirm icon', fg: 'color-green-dark', bg: 'theme-bg-affirm', minRatio: 3, type: 'ui' },

  // Alerts — warn
  { label: 'Alert warn text', fg: 'theme-fg-warn', bg: 'theme-bg-warn', minRatio: 4.5, type: 'text' },
  { label: 'Alert warn border', fg: 'theme-border-warn', bg: 'theme-bg-warn', minRatio: 3, type: 'ui', structural: true },
  { label: 'Alert warn icon', fg: 'color-yellow-dark', bg: 'theme-bg-warn', minRatio: 3, type: 'ui' },

  // Alerts — destructive
  { label: 'Alert destructive text', fg: 'theme-fg-destructive', bg: 'theme-bg-destructive', minRatio: 4.5, type: 'text' },
  { label: 'Alert destructive border', fg: 'theme-border-destructive', bg: 'theme-bg-destructive', minRatio: 3, type: 'ui', structural: true },
  { label: 'Alert destructive icon', fg: 'color-red', bg: 'theme-bg-destructive', minRatio: 3, type: 'ui' },
];

export const RAMP_GROUPS = {
  grayscale: ['color-black', 'color-gray-extra-dark', 'color-dark-gray', 'color-gray', 'color-light-gray', 'color-gray-extra-light', 'color-white'],
  red: ['color-red-extra-dark', 'color-red-dark', 'color-red', 'color-red-light', 'color-red-extra-light'],
  green: ['color-green-extra-dark', 'color-green-dark', 'color-green', 'color-green-light', 'color-green-extra-light'],
  blue: ['color-blue-extra-dark', 'color-blue-dark', 'color-blue', 'color-blue-light', 'color-blue-extra-light'],
  pink: ['color-pink-extra-dark', 'color-pink-dark', 'color-pink', 'color-pink-light', 'color-pink-extra-light'],
  yellow: ['color-yellow-extra-dark', 'color-yellow-dark', 'color-yellow', 'color-yellow-light', 'color-yellow-extra-light'],
  cyan: ['color-cyan-extra-dark', 'color-cyan-dark', 'color-cyan', 'color-cyan-light', 'color-cyan-extra-light'],
};

export const MID_CHROMA_HUES = ['color-red', 'color-green', 'color-blue'];

/** Resolved alert icon tokens per mode (matches tokens.css). */
export const ALERT_ICON = {
  light: {
    'Alert affirm icon': 'color-green-dark',
    'Alert warn icon': 'color-yellow-dark',
    'Alert destructive icon': 'color-red',
  },
  dark: {
    'Alert affirm icon': 'color-green-light',
    'Alert warn icon': 'color-yellow-light',
    'Alert destructive icon': 'color-red-light',
  },
};
