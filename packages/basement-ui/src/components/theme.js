/**
 * Apply color scheme to html.is-dark before first paint.
 * Load in <head> to avoid FOUC.
 *
 * Preference: stored choice, then prefers-color-scheme.
 * Wire icon buttons with data-theme-toggle:
 *
 *   <button type="button" class="btn btn--xs btn--default btn--icon"
 *     data-theme-toggle aria-label="Dark mode" aria-pressed="false">
 *     <i class="ph ph-moon icon--m" aria-hidden="true"></i>
 *     <i class="ph ph-sun icon--m" aria-hidden="true"></i>
 *   </button>
 */
(function () {
  var STORAGE_KEY = 'basement-theme';
  var LEGACY_KEY = 'basement-ui-dark-mode';
  var mq = matchMedia('(prefers-color-scheme: dark)');

  function readStored() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === '1' || v === '0') return v;
      v = localStorage.getItem(LEGACY_KEY);
      if (v === '1' || v === '0') return v;
    } catch (err) {}
    return null;
  }

  function preferred() {
    var stored = readStored();
    if (stored === '1') return true;
    if (stored === '0') return false;
    return mq.matches;
  }

  function persist(dark) {
    try {
      localStorage.setItem(STORAGE_KEY, dark ? '1' : '0');
      localStorage.removeItem(LEGACY_KEY);
    } catch (err) {}
  }

  function syncToggles(dark) {
    var label = dark ? 'Light mode' : 'Dark mode';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label', label);
      var tipId = btn.getAttribute('aria-describedby');
      if (!tipId) return;
      var tip = document.getElementById(tipId);
      if (tip) tip.textContent = label;
    });
  }

  function notify(dark) {
    document.documentElement.dispatchEvent(
      new CustomEvent('basement-theme', { bubbles: true, detail: { dark: dark } })
    );
  }

  function apply(enabled, opts) {
    var dark = enabled == null ? preferred() : !!enabled;
    document.documentElement.classList.toggle('is-dark', dark);
    syncToggles(dark);
    if (!opts || !opts.silent) notify(dark);
  }

  function set(dark) {
    persist(!!dark);
    apply(!!dark);
  }

  function toggle() {
    set(!document.documentElement.classList.contains('is-dark'));
  }

  function wire(root) {
    var scope = root && root.querySelectorAll ? root : document;
    if (scope.matches && scope.matches('[data-theme-toggle]')) {
      bind(scope);
    }
    scope.querySelectorAll('[data-theme-toggle]').forEach(bind);
    syncToggles(document.documentElement.classList.contains('is-dark'));
  }

  function bind(btn) {
    if (btn.__basementTheme) return;
    btn.__basementTheme = true;
    btn.addEventListener('click', toggle);
  }

  apply(null, { silent: true });

  mq.addEventListener('change', function () {
    if (readStored() !== null) return;
    apply();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      wire();
    });
  } else {
    wire();
  }

  window.BasementTheme = {
    apply: function () {
      apply();
    },
    set: set,
    toggle: toggle,
    isDark: function () {
      return document.documentElement.classList.contains('is-dark');
    },
    media: mq,
    wire: wire,
  };
})();
