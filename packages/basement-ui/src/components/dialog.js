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

  function open(hostOrDialog) {
    var host = hostFor(hostOrDialog) || hostOrDialog;
    if (!host || !host.classList.contains('dialog-host')) return;
    host.classList.add('is-dialog-open');
    syncAria(host);
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
