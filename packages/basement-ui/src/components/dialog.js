/**
 * Dialog — centered modal with optional blurry overlay (default) or plain panel.
 *
 * Markup:
 *   <div class="dialog-host" id="confirm">
 *     <div class="dialog-backdrop" aria-hidden="true"></div>
 *     <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
 *       <div class="dialog-body">
 *         <h2 class="dialog-title" id="confirm-title">…</h2>
 *         <p class="dialog-description">…</p>
 *       </div>
 *       <div class="dialog-actions">
 *         <button type="button" data-dialog-close>Cancel</button>
 *         <button type="button" class="btn btn--accent" data-dialog-close>Confirm</button>
 *       </div>
 *     </div>
 *   </div>
 *   <button type="button" data-dialog-open="confirm">Open</button>
 *
 * Add dialog-host--plain to omit the overlay so the page stays visible and
 * clickable around the panel.
 * Add dialog--guide on the panel for Tabs plus a rich scrolling body
 * (onboarding or help). Put Close on .dialog-heading, outside the body.
 * Add dialog--popup for a one-time notice with close and a Don’t show again
 * option (apps persist the preference).
 * Dismissal: data-overlay-dismiss="both" (default), "escape", "backdrop", or "none".
 * data-dialog-static is an alias of none and also keeps the demo from closing.
 * Inside .overlay-root the host covers that box instead of the page.
 */
(function () {
  function hostFor(el) {
    if (!el) return null;
    if (el.classList && el.classList.contains('dialog-host')) return el;
    return el.closest ? el.closest('.dialog-host') : null;
  }

  function dialogFor(host) {
    if (!host) return null;
    return host.querySelector(':scope > .dialog');
  }

  function isStatic(host) {
    return host && host.hasAttribute('data-dialog-static');
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

  function isPlain(host) {
    return host && host.classList.contains('dialog-host--plain');
  }

  function syncAria(host) {
    if (!host) return;
    var open = host.classList.contains('is-dialog-open');
    var dialog = dialogFor(host);
    if (dialog) {
      dialog.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
    var id = host.id;
    if (!id) return;
    document.querySelectorAll('[data-dialog-open]').forEach(function (btn) {
      var target = btn.getAttribute('data-dialog-open') || '';
      target = target.replace(/^#/, '');
      if (target !== id) return;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function syncDialogInert(host, on) {
    if (!host) return;
    var enable = !!(on && !isPlain(host));
    var root = host.closest ? host.closest('.overlay-root') : null;
    var stopAt = root
      ? root
      : (host.classList.contains('dialog-host--demo') ? host.parentElement : document.body);
    var el = host;
    while (el && el !== stopAt) {
      var parent = el.parentElement;
      if (!parent) break;
      Array.prototype.forEach.call(parent.children, function (child) {
        if (child === el) return;
        if (enable) {
          child.setAttribute('inert', '');
          child.setAttribute('data-basement-dialog-inert', '');
        } else if (child.hasAttribute('data-basement-dialog-inert')) {
          releaseInert(child, 'data-basement-dialog-inert');
        }
      });
      if (parent === stopAt || parent === document.documentElement) break;
      el = parent;
    }
  }

  function open(hostOrDialog) {
    var host = hostFor(hostOrDialog) || hostOrDialog;
    if (!host || !host.classList.contains('dialog-host')) return;
    if (host.hasAttribute('data-basement-sheet-inert')) releaseInert(host, 'data-basement-sheet-inert');
    if (host.hasAttribute('data-basement-dialog-inert')) releaseInert(host, 'data-basement-dialog-inert');
    host.__basementDialogOpener = document.activeElement;
    host.classList.add('is-dialog-open');
    syncAria(host);
    if (!isPlain(host)) syncDialogInert(host, true);
    var dialog = dialogFor(host);
    if (dialog && typeof dialog.focus === 'function') {
      if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
      try {
        dialog.focus({ preventScroll: true });
      } catch (e) {
        dialog.focus();
      }
    }
  }

  function close(hostOrDialog) {
    var host = hostFor(hostOrDialog) || hostOrDialog;
    if (!host || !host.classList.contains('dialog-host')) return;
    if (isStatic(host)) return;
    host.classList.remove('is-dialog-open');
    syncAria(host);
    syncDialogInert(host, false);
    var opener = host.__basementDialogOpener;
    host.__basementDialogOpener = null;
    if (opener && typeof opener.focus === 'function' && document.contains(opener)) {
      try {
        opener.focus({ preventScroll: true });
      } catch (e) {
        opener.focus();
      }
    }
  }

  function toggle(hostOrDialog) {
    var host = hostFor(hostOrDialog) || hostOrDialog;
    if (!host || !host.classList.contains('dialog-host')) return;
    if (host.classList.contains('is-dialog-open')) close(host);
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

    scope.querySelectorAll('[data-dialog-open]').forEach(function (btn) {
      if (btn.__basementDialogOpen) return;
      btn.__basementDialogOpen = true;
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-dialog-open') || '';
        id = id.replace(/^#/, '');
        if (!id) return;
        var host = document.getElementById(id);
        if (host) open(host);
      });
      var targetId = (btn.getAttribute('data-dialog-open') || '').replace(/^#/, '');
      if (targetId) {
        var host = document.getElementById(targetId);
        if (host) {
          btn.setAttribute('aria-controls', targetId);
          btn.setAttribute(
            'aria-expanded',
            host.classList.contains('is-dialog-open') ? 'true' : 'false'
          );
        }
      }
    });

    scope.querySelectorAll('[data-dialog-close]').forEach(function (btn) {
      if (btn.__basementDialogClose) return;
      btn.__basementDialogClose = true;
      btn.addEventListener('click', function () {
        close(btn);
      });
    });

    scope.querySelectorAll('.dialog-host').forEach(function (host) {
      if (host.__basementDialogWired) return;
      host.__basementDialogWired = true;
      syncAria(host);
      if (host.classList.contains('is-dialog-open') && !isPlain(host)) {
        syncDialogInert(host, true);
      }

      var backdrop = host.querySelector(':scope > .dialog-backdrop');
      if (backdrop && !backdrop.__basementDialogBackdrop) {
        backdrop.__basementDialogBackdrop = true;
        backdrop.addEventListener('click', function () {
          if (isPlain(host) || !allowsBackdrop(host)) return;
          close(host);
        });
      }
    });
  }

  function init(root) {
    wire(root || document);
  }

  if (!window.__basementDialogEsc) {
    window.__basementDialogEsc = true;
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      var host = topmostEscapeHost();
      if (!host || !host.classList.contains('dialog-host')) return;
      event.preventDefault();
      close(host);
    });
  }

  window.BasementDialog = {
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
