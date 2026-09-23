/**
 * Sheet — bottom panel with a blurry overlay.
 *
 * Markup:
 *   <div class="sheet-host" id="choose">
 *     <div class="sheet-backdrop" aria-hidden="true"></div>
 *     <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="choose-title">
 *       <div class="sheet-heading">
 *         <h2 class="sheet-title" id="choose-title">…</h2>
 *       </div>
 *       <div class="sheet-body">…</div>
 *       <div class="sheet-actions">
 *         <button type="button" data-sheet-close>Cancel</button>
 *         <button type="button" class="btn btn--default" data-sheet-close>Done</button>
 *       </div>
 *     </div>
 *   </div>
 *   <button type="button" data-sheet-open="choose">Open</button>
 *
 * Add sheet--half for a panel that is half the height of the page or overlay root.
 * Dismissal: data-overlay-dismiss="both" (default), "escape", "backdrop", or "none".
 * data-sheet-static keeps a reference sample from closing.
 * Place the host as a direct child of .overlay-root to cover that box instead of the page.
 */
(function () {
  function hostFor(el) {
    if (!el) return null;
    if (el.classList && el.classList.contains('sheet-host')) return el;
    return el.closest ? el.closest('.sheet-host') : null;
  }

  function sheetFor(host) {
    if (!host) return null;
    return host.querySelector(':scope > .sheet');
  }

  function isStatic(host) {
    return host && host.hasAttribute('data-sheet-static');
  }

  function dismissMode(host) {
    if (!host) return 'both';
    if (host.hasAttribute('data-dialog-static') || host.hasAttribute('data-sheet-static')) return 'none';
    var raw = (host.getAttribute('data-overlay-dismiss') || 'both').toLowerCase().trim();
    if (raw === 'none' || raw === 'escape' || raw === 'backdrop' || raw === 'both') return raw;
    return 'both';
  }

  function allowsEscape(host) {
    var mode = dismissMode(host);
    return mode === 'both' || mode === 'escape';
  }

  function allowsBackdrop(host) {
    var mode = dismissMode(host);
    return mode === 'both' || mode === 'backdrop';
  }

  function releaseInert(el, attr) {
    el.removeAttribute(attr);
    if (el.hasAttribute('data-basement-dialog-inert')) return;
    if (el.hasAttribute('data-basement-sheet-inert')) return;
    if (el.hasAttribute('data-basement-overlay-inert')) return;
    el.removeAttribute('inert');
  }

  function syncAria(host) {
    if (!host) return;
    var open = host.classList.contains('is-sheet-open');
    var sheet = sheetFor(host);
    if (sheet) sheet.setAttribute('aria-hidden', open ? 'false' : 'true');
    var id = host.id;
    if (!id) return;
    document.querySelectorAll('[data-sheet-open]').forEach(function (btn) {
      var target = (btn.getAttribute('data-sheet-open') || '').replace(/^#/, '');
      if (target !== id) return;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function syncInert(host, on) {
    if (!host) return;
    var root = host.closest ? host.closest('.overlay-root') : null;
    var stopAt = root ? root : document.body;
    var el = host;
    while (el && el !== stopAt) {
      var parent = el.parentElement;
      if (!parent) break;
      Array.prototype.forEach.call(parent.children, function (child) {
        if (child === el) return;
        if (on) {
          child.setAttribute('inert', '');
          child.setAttribute('data-basement-sheet-inert', '');
        } else if (child.hasAttribute('data-basement-sheet-inert')) {
          releaseInert(child, 'data-basement-sheet-inert');
        }
      });
      if (parent === stopAt || parent === document.documentElement) break;
      el = parent;
    }
  }

  function focusSheet(host) {
    var sheet = sheetFor(host);
    if (!sheet || typeof sheet.focus !== 'function') return;
    if (!sheet.hasAttribute('tabindex')) sheet.setAttribute('tabindex', '-1');
    try {
      sheet.focus({ preventScroll: true });
    } catch (e) {
      sheet.focus();
    }
  }

  function open(hostOrSheet) {
    var host = hostFor(hostOrSheet) || hostOrSheet;
    if (!host || !host.classList.contains('sheet-host')) return;
    if (host.hasAttribute('data-basement-dialog-inert')) releaseInert(host, 'data-basement-dialog-inert');
    if (host.hasAttribute('data-basement-sheet-inert')) releaseInert(host, 'data-basement-sheet-inert');
    host.__basementSheetOpener = document.activeElement;
    host.classList.add('is-sheet-open');
    syncAria(host);
    syncInert(host, true);
    focusSheet(host);
  }

  function close(hostOrSheet) {
    var host = hostFor(hostOrSheet) || hostOrSheet;
    if (!host || !host.classList.contains('sheet-host')) return;
    if (isStatic(host)) return;
    host.classList.remove('is-sheet-open');
    syncAria(host);
    syncInert(host, false);
    var opener = host.__basementSheetOpener;
    host.__basementSheetOpener = null;
    if (opener && typeof opener.focus === 'function' && document.contains(opener)) {
      try {
        opener.focus({ preventScroll: true });
      } catch (e) {
        opener.focus();
      }
    }
  }

  function toggle(hostOrSheet) {
    var host = hostFor(hostOrSheet) || hostOrSheet;
    if (!host || !host.classList.contains('sheet-host')) return;
    if (host.classList.contains('is-sheet-open')) close(host);
    else open(host);
  }

  function topmostEscapeHost() {
    var active = document.activeElement;
    var focusRoot = active && active.closest ? active.closest('.overlay-root') : null;
    var nodes = document.querySelectorAll('.dialog-host.is-dialog-open, .sheet-host.is-sheet-open');
    var inRoot = [];
    var page = [];
    var otherContained = [];
    Array.prototype.forEach.call(nodes, function (host) {
      if (!allowsEscape(host)) return;
      var hostRoot = host.closest('.overlay-root');
      if (hostRoot && focusRoot && hostRoot === focusRoot) inRoot.push(host);
      else if (!hostRoot) page.push(host);
      else otherContained.push(host);
    });
    if (inRoot.length) return inRoot[inRoot.length - 1];
    if (page.length) return page[page.length - 1];
    if (otherContained.length) return otherContained[otherContained.length - 1];
    return null;
  }

  function wire(root) {
    var scope = root || document;

    scope.querySelectorAll('[data-sheet-open]').forEach(function (btn) {
      if (btn.__basementSheetOpen) return;
      btn.__basementSheetOpen = true;
      btn.addEventListener('click', function () {
        var id = (btn.getAttribute('data-sheet-open') || '').replace(/^#/, '');
        if (!id) return;
        var host = document.getElementById(id);
        if (host) open(host);
      });
      var targetId = (btn.getAttribute('data-sheet-open') || '').replace(/^#/, '');
      if (targetId) {
        var host = document.getElementById(targetId);
        if (host) {
          btn.setAttribute('aria-controls', targetId);
          btn.setAttribute('aria-expanded', host.classList.contains('is-sheet-open') ? 'true' : 'false');
        }
      }
    });

    scope.querySelectorAll('[data-sheet-close]').forEach(function (btn) {
      if (btn.__basementSheetClose) return;
      btn.__basementSheetClose = true;
      btn.addEventListener('click', function () {
        close(btn);
      });
    });

    scope.querySelectorAll('.sheet-host').forEach(function (host) {
      if (host.__basementSheetWired) return;
      host.__basementSheetWired = true;
      syncAria(host);
      if (host.classList.contains('is-sheet-open')) syncInert(host, true);

      var backdrop = host.querySelector(':scope > .sheet-backdrop');
      if (backdrop && !backdrop.__basementSheetBackdrop) {
        backdrop.__basementSheetBackdrop = true;
        backdrop.addEventListener('click', function () {
          if (!allowsBackdrop(host)) return;
          close(host);
        });
      }
    });
  }

  function init(root) {
    wire(root || document);
  }

  if (!window.__basementSheetEsc) {
    window.__basementSheetEsc = true;
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      var host = topmostEscapeHost();
      if (!host || !host.classList.contains('sheet-host')) return;
      event.preventDefault();
      close(host);
    });
  }

  window.BasementSheet = {
    init: init,
    wire: wire,
    open: open,
    close: close,
    toggle: toggle,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init(document);
    });
  } else {
    init(document);
  }
})();
