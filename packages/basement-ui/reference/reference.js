const SECTION_STORAGE_KEY = 'basement-ui-section';
const DARK_MODE_STORAGE_KEY = 'basement-ui-dark-mode';
const COLUMN_OVERLAY_STORAGE_KEY = 'basement-ui-show-columns';
const DEFAULT_SECTION = 'home';

// ── Section nav ──
const navItems = document.querySelectorAll('.sidebar-item[data-section]');
const sections = document.querySelectorAll('.section');
const sidebarHomeBtn = document.getElementById('sidebarHomeBtn');
const appSidebar = document.getElementById('appSidebar');
const page = document.querySelector('.page');
const narrowMedia = window.matchMedia('(max-width: 43.9375rem)');

function isNarrowViewport() {
  return narrowMedia.matches;
}

function setSidebarOpen(open) {
  if (!appSidebar) return;
  if (window.BasementPanel) {
    if (open) window.BasementPanel.open(appSidebar);
    else window.BasementPanel.close(appSidebar);
  } else {
    appSidebar.classList.toggle('is-open', open);
  }
  syncSidebarLock();
}

function closeSidebar() {
  setSidebarOpen(false);
}

function syncSidebarLock() {
  const open = !!appSidebar?.classList.contains('is-open');
  document.documentElement.classList.toggle('is-sidebar-locked', open && isNarrowViewport());
}

if (appSidebar) {
  new MutationObserver(syncSidebarLock).observe(appSidebar, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

narrowMedia.addEventListener('change', () => {
  if (!isNarrowViewport()) closeSidebar();
  syncSidebarLock();
});
syncSidebarLock();

function sectionHash(sectionId) {
  return sectionId === DEFAULT_SECTION ? '#home' : `#${sectionId}`;
}

function sectionFromHash() {
  const id = window.location.hash.slice(1);
  const resolved = resolveSectionId(id);
  if (resolved && document.getElementById(resolved)) return resolved;
  if (!window.location.hash) return DEFAULT_SECTION;
  return null;
}

const SECTION_ALIASES = {
  'tabs-overflow': 'tabs',
  'timeline-axis': 'timeline',
  'graph-density': 'graph',
};

function resolveSectionId(sectionId) {
  if (!sectionId) return sectionId;
  return SECTION_ALIASES[sectionId] || sectionId;
}

function activateSection(sectionId) {
  sectionId = resolveSectionId(sectionId);
  const section = document.getElementById(sectionId);
  if (!section) return false;
  if (window.BasementFloat) window.BasementFloat.closeAll();
  navItems.forEach(n => n.classList.toggle('is-active', n.dataset.section === sectionId));
  if (sidebarHomeBtn) {
    sidebarHomeBtn.classList.toggle('is-active', sectionId === DEFAULT_SECTION);
  }
  sections.forEach(s => s.classList.remove('is-active'));
  section.classList.add('is-active');
  window.scrollTo(0, 0);
  requestAnimationFrame(syncColumnOverlay);
  return true;
}

function navigateToSection(sectionId, { replace = false } = {}) {
  sectionId = resolveSectionId(sectionId);
  if (!activateSection(sectionId)) return;
  closeSidebar();
  const hash = sectionHash(sectionId);
  localStorage.setItem(SECTION_STORAGE_KEY, sectionId);
  if (window.location.hash === hash) return;
  const method = replace ? 'replaceState' : 'pushState';
  history[method](null, '', hash);
}

navItems.forEach(item => {
  item.addEventListener('click', () => {
    navigateToSection(item.dataset.section);
  });
});

document.querySelectorAll('.home-card[data-section]').forEach(card => {
  card.addEventListener('click', () => {
    navigateToSection(card.dataset.section);
  });
});

if (sidebarHomeBtn) {
  sidebarHomeBtn.addEventListener('click', () => {
    navigateToSection(DEFAULT_SECTION);
  });
}

window.addEventListener('hashchange', () => {
  const sectionId = sectionFromHash();
  if (sectionId) {
    activateSection(sectionId);
    closeSidebar();
    localStorage.setItem(SECTION_STORAGE_KEY, sectionId);
  }
});

// ── Tabs demos ──
document.querySelectorAll('[data-tabs-demo]').forEach(demo => {
  const tablist = demo.querySelector('.tabs[role="tablist"], .tabs');
  const tabs = [...demo.querySelectorAll('[role="tab"]')];

  function activateTab(activeTab, { focus = false } = {}) {
    tabs.forEach(tab => {
      const isActive = tab === activeTab;
      const panelId = tab.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;

      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.tabIndex = isActive ? 0 : -1;
      if (panel && demo.contains(panel)) panel.hidden = !isActive;
    });

    if (focus) activeTab.focus();
    if (tablist && window.BasementTabs) window.BasementTabs.sync(tablist);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      const enabledTabs = tabs.filter(candidate =>
        !candidate.disabled && candidate.getAttribute('aria-disabled') !== 'true'
      );
      const currentIndex = enabledTabs.indexOf(tab);
      let nextTab;
      const stacked = tablist?.classList.contains('tabs--stacked');

      if (event.key === 'ArrowRight' || (stacked && event.key === 'ArrowDown')) {
        nextTab = enabledTabs[(currentIndex + 1) % enabledTabs.length];
      } else if (event.key === 'ArrowLeft' || (stacked && event.key === 'ArrowUp')) {
        nextTab = enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length];
      } else if (event.key === 'Home') {
        nextTab = enabledTabs[0];
      } else if (event.key === 'End') {
        nextTab = enabledTabs.at(-1);
      }

      if (!nextTab) return;
      event.preventDefault();
      activateTab(nextTab, { focus: true });
    });
  });
});

// ── Scheme picker ──
function resolveColor(color) {
  const probe = document.createElement('span');
  probe.style.display = 'none';
  probe.style.backgroundColor = color;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).backgroundColor;
  document.body.removeChild(probe);
  return resolved;
}

function getThemeBorderColor() {
  const probe = document.createElement('span');
  probe.style.display = 'none';
  probe.style.borderColor = 'var(--theme-border)';
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).borderColor;
  document.body.removeChild(probe);
  return resolved;
}

function colorMatchesPageBackground(color) {
  return resolveColor(color) === getComputedStyle(document.body).backgroundColor;
}

function syncColorChipBorder(el, color) {
  el.style.borderColor = colorMatchesPageBackground(color)
    ? getThemeBorderColor()
    : 'transparent';
}

function syncAllColorChipBorders() {
  document.querySelectorAll('.picker-chip').forEach(chip => {
    syncColorChipBorder(chip, chip.dataset.color);
  });
  document.querySelectorAll('.scheme-swatch').forEach(swatch => {
    syncColorChipBorder(swatch, swatch.style.backgroundColor || swatch.style.background);
  });
}

const palette = [
  { name: 'Black',      var: '--color-black',      light: false },
  { name: 'Gray XD', var: '--color-gray-extra-dark', light: false },
  { name: 'Gray D',  var: '--color-dark-gray',  light: false },
  { name: 'Gray',       var: '--color-gray',       light: false },
  { name: 'Gray L', var: '--color-light-gray', light: true  },
  { name: 'Gray XL', var: '--color-gray-extra-light', light: true },
  { name: 'White',      var: '--color-white',      light: true  },
  { name: 'Red XD',    var: '--color-red-extra-dark',    light: false },
  { name: 'Red D',          var: '--color-red-dark',          light: false },
  { name: 'Red',               var: '--color-red',               light: false },
  { name: 'Red L',         var: '--color-red-light',         light: true  },
  { name: 'Red XL',   var: '--color-red-extra-light',   light: true  },
  { name: 'Green XD',  var: '--color-green-extra-dark',  light: false },
  { name: 'Green D',        var: '--color-green-dark',        light: false },
  { name: 'Green',             var: '--color-green',             light: false },
  { name: 'Green L',       var: '--color-green-light',       light: true  },
  { name: 'Green XL', var: '--color-green-extra-light', light: true  },
  { name: 'Blue XD',   var: '--color-blue-extra-dark',   light: false },
  { name: 'Blue D',         var: '--color-blue-dark',         light: false },
  { name: 'Blue',              var: '--color-blue',              light: false },
  { name: 'Blue L',        var: '--color-blue-light',        light: true  },
  { name: 'Blue XL',  var: '--color-blue-extra-light',  light: true  },
  { name: 'Yellow XD', var: '--color-yellow-extra-dark', light: false },
  { name: 'Yellow D',       var: '--color-yellow-dark',       light: false },
  { name: 'Yellow',            var: '--color-yellow',            light: false },
  { name: 'Yellow L',      var: '--color-yellow-light',      light: true  },
  { name: 'Yellow XL',var: '--color-yellow-extra-light',light: true  },
  { name: 'Pink XD',   var: '--color-pink-extra-dark',   light: false },
  { name: 'Pink D',         var: '--color-pink-dark',         light: false },
  { name: 'Pink',              var: '--color-pink',              light: false },
  { name: 'Pink L',        var: '--color-pink-light',        light: true  },
  { name: 'Pink XL',  var: '--color-pink-extra-light',  light: true  },
  { name: 'Cyan XD',   var: '--color-cyan-extra-dark',   light: false },
  { name: 'Cyan D',         var: '--color-cyan-dark',         light: false },
  { name: 'Cyan',              var: '--color-cyan',              light: false },
  { name: 'Cyan L',        var: '--color-cyan-light',        light: true  },
  { name: 'Cyan XL',  var: '--color-cyan-extra-light',  light: true  },
].map(({ name, var: tokenVar, light }) => ({
  name,
  color: getComputedStyle(document.documentElement).getPropertyValue(tokenVar).trim(),
  light,
}));

document.querySelectorAll('.scheme-picker').forEach(picker => {
  palette.forEach(({ name, color }) => {
    const chip = document.createElement('button');
    chip.className = 'picker-chip';
    chip.title = name;
    chip.dataset.color = color;
    chip.dataset.name = name;
    chip.style.background = color;
    syncColorChipBorder(chip, color);
    picker.appendChild(chip);
  });
});

let activeBtn = null;

document.querySelectorAll('.scheme-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const row = btn.closest('.scheme-row');
    const picker = row.querySelector('.scheme-picker');
    const isOpen = picker.classList.contains('is-open') && activeBtn === btn;
    document.querySelectorAll('.scheme-picker').forEach(p => p.classList.remove('is-open'));
    if (!isOpen) {
      activeBtn = btn;
      picker.classList.add('is-open');
    } else {
      activeBtn = null;
    }
  });
});

document.addEventListener('click', e => {
  if (e.target.matches('.picker-chip') && activeBtn) {
    const chip = e.target;
    const swatch = activeBtn.querySelector('.scheme-swatch');
    const nameSpan = activeBtn.querySelector('.scheme-color-name');
    swatch.style.background = chip.dataset.color;
    syncColorChipBorder(swatch, chip.dataset.color);
    nameSpan.textContent = chip.dataset.name;
    chip.closest('.scheme-picker').classList.remove('is-open');
    activeBtn = null;
    return;
  }
  document.querySelectorAll('.scheme-picker').forEach(p => p.classList.remove('is-open'));
  activeBtn = null;
  if (!e.target.closest('.dropdown-demo')) {
    closeAllDropdowns();
  }
});

// ── Dropdown ──
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-demo.is-open').forEach(demo => {
    demo.classList.remove('is-open');
    const trigger = demo.querySelector('.dropdown-trigger');
    const menu = demo.querySelector('.menu');
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  });
}

document.querySelectorAll('.dropdown-demo').forEach(demo => {
  const trigger = demo.querySelector('.dropdown-trigger');
  const menu = demo.querySelector('.menu');

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = demo.classList.contains('is-open');
    closeAllDropdowns();
    if (!isOpen) {
      demo.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
    }
  });

});

// ── Column overlay ──
const columnOverlay = document.getElementById('columnOverlay');
const columnOverlayToggle = document.getElementById('columnOverlayToggle');
const darkModeToggle = document.getElementById('darkModeToggle');

function setDarkMode(enabled) {
  document.documentElement.classList.toggle('is-dark', enabled);
  darkModeToggle.checked = enabled;
  syncAllColorChipBorders();
  syncTokenValues();
}

function syncTokenValues() {
  const styles = getComputedStyle(document.documentElement);
  document.querySelectorAll('.token-value[data-token]').forEach(el => {
    el.textContent = styles.getPropertyValue(el.dataset.token).trim().toUpperCase();
  });
}

darkModeToggle.addEventListener('change', () => {
  const enabled = darkModeToggle.checked;
  setDarkMode(enabled);
  localStorage.setItem(DARK_MODE_STORAGE_KEY, enabled ? '1' : '0');
});

const storedDark = localStorage.getItem(DARK_MODE_STORAGE_KEY);
if (storedDark === '1') {
  setDarkMode(true);
} else if (storedDark === '0') {
  setDarkMode(false);
} else if (document.documentElement.classList.contains('is-dark')) {
  darkModeToggle.checked = true;
  syncAllColorChipBorders();
  syncTokenValues();
} else {
  syncAllColorChipBorders();
  syncTokenValues();
}

function syncColumnOverlay() {
  const columns = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--columns'), 10);
  columnOverlay.innerHTML = '';
  for (let i = 0; i < columns; i++) {
    const cell = document.createElement('div');
    cell.className = 'column-overlay-cell';
    columnOverlay.appendChild(cell);
  }
}

function setColumnOverlayVisible(visible) {
  columnOverlay.classList.toggle('is-hidden', !visible);
  columnOverlayToggle.checked = visible;
}

columnOverlayToggle.addEventListener('change', () => {
  const visible = columnOverlayToggle.checked;
  setColumnOverlayVisible(visible);
  localStorage.setItem(COLUMN_OVERLAY_STORAGE_KEY, visible ? '1' : '');
});

syncColumnOverlay();
window.addEventListener('resize', syncColumnOverlay);

if (localStorage.getItem(COLUMN_OVERLAY_STORAGE_KEY) === '1') {
  setColumnOverlayVisible(true);
} else {
  setColumnOverlayVisible(false);
}

// ── Table sorting demo ──
function initTableSorting() {
  document.querySelectorAll('.table-demo').forEach(table => {
    const tbody = table.querySelector('tbody');
    const headers = table.querySelectorAll('th[data-sortable]');

    headers.forEach(th => {
      const btn = th.querySelector('.table-sort');
      if (!btn || !tbody) return;

      btn.addEventListener('click', () => {
        const colIndex = [...th.parentElement.children].indexOf(th);
        const sortType = th.dataset.sortType || 'string';
        const current = th.getAttribute('aria-sort');
        const next = current === 'ascending' ? 'descending' : 'ascending';

        headers.forEach(header => {
          if (header === th) return;
          header.setAttribute('aria-sort', 'none');
          const otherBtn = header.querySelector('.table-sort');
          const otherIcon = header.querySelector('.table-sort-icon');
          otherBtn?.classList.remove('is-sorted', 'is-sorted--asc', 'is-sorted--desc');
          if (otherIcon) otherIcon.className = 'ph ph-caret-down table-sort-icon';
        });

        th.setAttribute('aria-sort', next);
        btn.classList.add('is-sorted');
        btn.classList.toggle('is-sorted--asc', next === 'ascending');
        btn.classList.toggle('is-sorted--desc', next === 'descending');
        const icon = btn.querySelector('.table-sort-icon');
        if (icon) {
          icon.className = `ph ph-caret-${next === 'ascending' ? 'up' : 'down'} table-sort-icon`;
        }

        const rows = [...tbody.querySelectorAll('tr')];
        rows.sort((rowA, rowB) => {
          const cellA = rowA.children[colIndex];
          const cellB = rowB.children[colIndex];
          const aVal = cellA.dataset.sortValue ?? cellA.textContent.trim();
          const bVal = cellB.dataset.sortValue ?? cellB.textContent.trim();
          const cmp = sortType === 'number'
            ? Number(aVal) - Number(bVal)
            : aVal.localeCompare(bVal, undefined, { sensitivity: 'base' });
          return next === 'ascending' ? cmp : -cmp;
        });
        rows.forEach(row => tbody.appendChild(row));
      });
    });
  });
}

initTableSorting();

// ── Table selectable rows demo ──
function initTableSelection() {
  document.querySelectorAll('.table-demo-selectable').forEach(table => {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        rows.forEach(other => {
          other.classList.remove('is-selected');
          other.removeAttribute('aria-selected');
        });
        row.classList.add('is-selected');
        row.setAttribute('aria-selected', 'true');
      });
    });
  });
}

initTableSelection();

// ── Pattern demos: edge fades ──
function initPatternEdgeFades() {
  if (!window.BasementEdgeFade) return;
  document.querySelectorAll('.pattern-fade-x').forEach(el => {
    window.BasementEdgeFade.wire(el, 'x');
  });
  document.querySelectorAll('.pattern-fade-y').forEach(el => {
    window.BasementEdgeFade.wire(el, 'y');
  });
  document.querySelectorAll('.pattern-header-fade').forEach(el => {
    window.BasementEdgeFade.wireHeader(el);
  });
}

initPatternEdgeFades();

// ── App Icon builder ──
const APP_ICON_DEFAULT = 'ph-bounding-box';
const APP_ICON_STORAGE_KEY = 'basement-ui-app-icon';
let currentAppIcon = APP_ICON_DEFAULT;

function appIconPhClass(iconName) {
  return iconName.startsWith('ph-') ? iconName : `ph-${iconName}`;
}

function parsePseudoContent(value) {
  if (!value || value === 'none') return '';
  let raw = value.trim();
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1);
  }
  return raw.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\(.)/g, '$1');
}

function glyphForPhClass(phClass) {
  const probe = document.createElement('i');
  probe.className = `ph ${phClass}`;
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  const glyph = parsePseudoContent(getComputedStyle(probe, '::before').content);
  probe.remove();
  return glyph;
}

function tokenColor(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function roundRectPath(ctx, x, y, size, radius) {
  const r = Math.min(radius, size / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + size, y, x + size, y + size, r);
  ctx.arcTo(x + size, y + size, x, y + size, r);
  ctx.arcTo(x, y + size, x, y, r);
  ctx.arcTo(x, y, x + size, y, r);
  ctx.closePath();
}

async function renderAppIconCanvas(phClass, size, scheme = 'dark') {
  await document.fonts.load(`${Math.round(size * 0.55)}px Phosphor`);
  await document.fonts.ready;
  const glyph = glyphForPhClass(phClass);
  if (!glyph) throw new Error(`Missing glyph for ${phClass}`);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const black = tokenColor('--color-black', '#131410');
  const white = tokenColor('--color-white', '#FFFFF9');
  const lightGray = tokenColor('--color-light-gray', '#DEDFD8');
  const dark = scheme !== 'light';
  const radius = size * 0.125;

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = dark ? black : white;
  roundRectPath(ctx, 0, 0, size, radius);
  ctx.fill();

  if (!dark) {
    ctx.strokeStyle = lightGray;
    ctx.lineWidth = Math.max(1, size * (1 / 64));
    roundRectPath(ctx, 0, 0, size, radius);
    ctx.stroke();
  }

  ctx.fillStyle = dark ? white : black;
  ctx.font = `${size * 0.55}px Phosphor`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Optical center: Phosphor glyphs sit slightly high with alphabetic metrics.
  ctx.fillText(glyph, size / 2, size / 2 + size * 0.02);
  return canvas;
}

function downloadCanvas(canvas, filename) {
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function slugFromPhClass(phClass) {
  return phClass.replace(/^ph-/, '');
}

function currentAppIconScheme() {
  const checked = document.querySelector('input[name="app-icon-scheme"]:checked');
  return checked?.value === 'light' ? 'light' : 'dark';
}

function setAppIconSelection(phClass, { persist = true } = {}) {
  const className = appIconPhClass(phClass);
  currentAppIcon = className;
  document.querySelectorAll('[data-app-icon-preview] .ph').forEach(icon => {
    icon.className = `ph ${className}`;
  });
  document.querySelectorAll('#appIconPicker .app-icon-picker-item').forEach(item => {
    const selected = item.dataset.icon === className;
    item.classList.toggle('is-selected', selected);
    item.setAttribute('aria-selected', selected ? 'true' : 'false');
  });
  if (persist) localStorage.setItem(APP_ICON_STORAGE_KEY, className);
}

async function applyAppIconFavicon(phClass, scheme = 'dark') {
  const canvas = await renderAppIconCanvas(phClass, 32, scheme);
  let link = document.querySelector('link[data-app-icon-favicon]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.dataset.appIconFavicon = '';
    document.head.appendChild(link);
  }
  link.href = canvas.toDataURL('image/png');
}

function initAppIconBuilder() {
  const picker = document.getElementById('appIconPicker');
  if (!picker) return;

  const catalog = document.querySelectorAll('#icons .col-row--icons > div');
  const seen = new Set();
  catalog.forEach(cell => {
    const icon = cell.querySelector('.ph');
    const label = cell.querySelector('.token-name')?.textContent.trim();
    if (!icon || !label) return;
    const phClass = [...icon.classList].find(c => c.startsWith('ph-'));
    if (!phClass || seen.has(phClass)) return;
    seen.add(phClass);

    const item = document.createElement('div');
    item.className = 'app-icon-picker-item';
    item.dataset.icon = phClass;
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', 'false');
    item.tabIndex = 0;
    item.innerHTML = `
      <div class="icon-face icon-face--l"><i class="ph ${phClass}" aria-hidden="true"></i></div>
      <div class="token-name">${label}</div>
    `;
    const choose = () => setAppIconSelection(phClass);
    item.addEventListener('click', choose);
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        choose();
      }
    });
    picker.appendChild(item);
  });

  const stored = localStorage.getItem(APP_ICON_STORAGE_KEY);
  const initial = stored && seen.has(stored) ? stored : APP_ICON_DEFAULT;
  setAppIconSelection(initial);

  document.querySelectorAll('[data-app-icon-download]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const size = Number(btn.dataset.appIconDownload) || 512;
      const scheme = currentAppIconScheme();
      try {
        const canvas = await renderAppIconCanvas(currentAppIcon, size, scheme);
        const kind = size >= 256 ? 'app-icon' : 'favicon';
        downloadCanvas(canvas, `${kind}-${scheme}-${slugFromPhClass(currentAppIcon)}-${size}.png`);
      } catch (err) {
        console.error(err);
      }
    });
  });

  const applyBtn = document.getElementById('appIconApplyFavicon');
  applyBtn?.addEventListener('click', async () => {
    try {
      await applyAppIconFavicon(currentAppIcon, currentAppIconScheme());
    } catch (err) {
      console.error(err);
    }
  });
}

initAppIconBuilder();

const initialSection = sectionFromHash()
  || localStorage.getItem(SECTION_STORAGE_KEY)
  || DEFAULT_SECTION;
navigateToSection(initialSection, { replace: true });
