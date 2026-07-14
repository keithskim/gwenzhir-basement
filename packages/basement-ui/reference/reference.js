const SECTION_STORAGE_KEY = 'basement-ui-section';
const DARK_MODE_STORAGE_KEY = 'basement-ui-dark-mode';
const COLUMN_OVERLAY_STORAGE_KEY = 'basement-ui-show-columns';
const DEFAULT_SECTION = 'home';

// ── Section nav ──
const navItems = document.querySelectorAll('.sidebar-item[data-section]');
const sections = document.querySelectorAll('.section');
const sidebarHomeBtn = document.getElementById('sidebarHomeBtn');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const page = document.querySelector('.page');
const narrowMedia = window.matchMedia('(max-width: 39.9375rem)');

function isNarrowViewport() {
  return narrowMedia.matches;
}

function syncSidebarToggleVisibility() {
  if (!sidebarToggle) return;
  if (isNarrowViewport()) {
    sidebarToggle.hidden = false;
  } else {
    sidebarToggle.hidden = true;
    setSidebarOpen(false);
  }
}

function setSidebarOpen(open) {
  if (!page) return;
  page.classList.toggle('is-sidebar-open', open);
  if (sidebarToggle) {
    sidebarToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    sidebarToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.hidden = !open;
  }
  document.documentElement.classList.toggle('is-sidebar-locked', open && isNarrowViewport());
}

function closeSidebar() {
  setSidebarOpen(false);
}

if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    setSidebarOpen(!page.classList.contains('is-sidebar-open'));
  });
}

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener('click', closeSidebar);
}

narrowMedia.addEventListener('change', syncSidebarToggleVisibility);
syncSidebarToggleVisibility();

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && page?.classList.contains('is-sidebar-open')) {
    closeSidebar();
  }
});

function sectionHash(sectionId) {
  return sectionId === DEFAULT_SECTION ? '#home' : `#${sectionId}`;
}

function sectionFromHash() {
  const id = window.location.hash.slice(1);
  if (id && document.getElementById(id)) return id;
  if (!window.location.hash) return DEFAULT_SECTION;
  return null;
}

function activateSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return false;
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
}

darkModeToggle.addEventListener('change', () => {
  const enabled = darkModeToggle.checked;
  setDarkMode(enabled);
  localStorage.setItem(DARK_MODE_STORAGE_KEY, enabled ? '1' : '');
});

if (localStorage.getItem(DARK_MODE_STORAGE_KEY) === '1') {
  setDarkMode(true);
} else {
  syncAllColorChipBorders();
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

const initialSection = sectionFromHash()
  || localStorage.getItem(SECTION_STORAGE_KEY)
  || DEFAULT_SECTION;
navigateToSection(initialSection, { replace: true });
