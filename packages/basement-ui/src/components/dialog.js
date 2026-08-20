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
 * Add dialog-host--plain to omit the blurry overlay.
 * Static demos: data-dialog-static (Escape / backdrop do not dismiss).
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
    var stopAt = host.classList.contains('dialog-host--demo')
      ? host.parentElement
      : document.body;
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
          child.removeAttribute('inert');
          child.removeAttribute('data-basement-dialog-inert');
        }
      });
      if (parent === stopAt || parent === document.documentElement) break;
      el = parent;
    }
  }

  function open(hostOrDialog) {
    var host = hostFor(hostOrDialog) || hostOrDialog;
    if (!host || !host.classList.contains('dialog-host')) return;
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

  function openHosts() {
    return Array.prototype.slice.call(
      document.querySelectorAll('.dialog-host.is-dialog-open:not([data-dialog-static])')
    );
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
          if (isPlain(host) || isStatic(host)) return;
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
      if (event.key !== 'Escape') return;
      var hosts = openHosts();
      if (!hosts.length) return;
      close(hosts[hosts.length - 1]);
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
