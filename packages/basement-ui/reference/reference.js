const SECTION_STORAGE_KEY = 'basement-ui-section';
const DARK_MODE_STORAGE_KEY = 'basement-ui-dark-mode';
const COLUMN_OVERLAY_STORAGE_KEY = 'basement-ui-show-columns';

// ── Section nav ──
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

function activateSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return false;
  navItems.forEach(n => n.classList.toggle('is-active', n.dataset.section === sectionId));
  sections.forEach(s => s.classList.remove('is-active'));
  section.classList.add('is-active');
  window.scrollTo(0, 0);
  requestAnimationFrame(syncColumnOverlay);
  return true;
}

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const sectionId = item.dataset.section;
    activateSection(sectionId);
    localStorage.setItem(SECTION_STORAGE_KEY, sectionId);
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
  { name: 'Black',        color: '#111111', light: false },
  { name: 'Dark Gray',    color: '#333333', light: false },
  { name: 'Gray',         color: '#999999', light: false },
  { name: 'Light Gray',   color: '#DDDDDD', light: true  },
  { name: 'White',        color: '#FFFFFF', light: true  },
  { name: 'Red Dark',     color: '#7A1000', light: false },
  { name: 'Red',          color: '#EF3D28', light: false },
  { name: 'Red Light',    color: '#FFEBE6', light: true  },
  { name: 'Green Dark',   color: '#133D22', light: false },
  { name: 'Green',        color: '#33BB55', light: false },
  { name: 'Green Light',  color: '#E0F8E8', light: true  },
  { name: 'Blue Dark',    color: '#0F1848', light: false },
  { name: 'Blue',         color: '#3366EE', light: false },
  { name: 'Blue Light',   color: '#E0EAFF', light: true  },
];

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
    const menu = demo.querySelector('.dropdown-menu');
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  });
}

document.querySelectorAll('.dropdown-demo').forEach(demo => {
  const trigger = demo.querySelector('.dropdown-trigger');
  const menu = demo.querySelector('.dropdown-menu');

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

  menu.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      menu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
    });
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

const savedSection = localStorage.getItem(SECTION_STORAGE_KEY);
if (savedSection) activateSection(savedSection);
