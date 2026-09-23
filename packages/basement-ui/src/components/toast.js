/**
 * Toast — transient status above the page, or above an overlay root.
 *
 * Markup:
 *   <div class="toast-host" id="saved" data-toast-duration="2400" aria-live="polite">
 *     <div class="toast" role="status">Changes saved</div>
 *   </div>
 *   <button type="button" data-toast-open="saved">Show</button>
 *
 * data-toast-duration is milliseconds. 0, or omitting it, leaves the toast up
 * until the app closes it. Inside .overlay-root the host pins to that box.
 */
(function () {
  function hostFor(el) {
    if (!el) return null;
    if (el.classList && el.classList.contains('toast-host')) return el;
    return el.closest ? el.closest('.toast-host') : null;
  }

  function clearTimer(host) {
    if (host && host.__basementToastTimer) {
      clearTimeout(host.__basementToastTimer);
      host.__basementToastTimer = null;
    }
  }

  function syncAria(host) {
    if (!host) return;
    var open = host.classList.contains('is-toast-open');
    var toast = host.querySelector(':scope > .toast');
    if (toast) toast.setAttribute('aria-hidden', open ? 'false' : 'true');
    var id = host.id;
    if (!id) return;
    document.querySelectorAll('[data-toast-open]').forEach(function (btn) {
      var target = (btn.getAttribute('data-toast-open') || '').replace(/^#/, '');
      if (target !== id) return;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function close(hostOrToast) {
    var host = hostFor(hostOrToast) || hostOrToast;
    if (!host || !host.classList.contains('toast-host')) return;
    clearTimer(host);
    host.classList.remove('is-toast-open');
    syncAria(host);
  }

  function open(hostOrToast) {
    var host = hostFor(hostOrToast) || hostOrToast;
    if (!host || !host.classList.contains('toast-host')) return;
    clearTimer(host);
    host.classList.add('is-toast-open');
    syncAria(host);
    var raw = host.getAttribute('data-toast-duration');
    if (raw == null || raw === '') return;
    var ms = Number(raw);
    if (!ms || ms < 0) return;
    host.__basementToastTimer = setTimeout(function () {
      close(host);
    }, ms);
  }

  function toggle(hostOrToast) {
    var host = hostFor(hostOrToast) || hostOrToast;
    if (!host || !host.classList.contains('toast-host')) return;
    if (host.classList.contains('is-toast-open')) close(host);
    else open(host);
  }

  function wire(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-toast-open]').forEach(function (btn) {
      if (btn.__basementToastOpen) return;
      btn.__basementToastOpen = true;
      btn.addEventListener('click', function () {
        var id = (btn.getAttribute('data-toast-open') || '').replace(/^#/, '');
        if (!id) return;
        var host = document.getElementById(id);
        if (host) open(host);
      });
      var targetId = (btn.getAttribute('data-toast-open') || '').replace(/^#/, '');
      if (targetId) {
        var host = document.getElementById(targetId);
        if (host) {
          btn.setAttribute('aria-controls', targetId);
          btn.setAttribute('aria-expanded', host.classList.contains('is-toast-open') ? 'true' : 'false');
        }
      }
    });
    scope.querySelectorAll('[data-toast-close]').forEach(function (btn) {
      if (btn.__basementToastClose) return;
      btn.__basementToastClose = true;
      btn.addEventListener('click', function () {
        var id = (btn.getAttribute('data-toast-close') || '').replace(/^#/, '');
        if (id) {
          var named = document.getElementById(id);
          if (named) close(named);
          return;
        }
        close(btn);
      });
    });
    scope.querySelectorAll('.toast-host').forEach(function (host) {
      if (host.__basementToastWired) return;
      host.__basementToastWired = true;
      syncAria(host);
    });
  }

  function init(root) {
    wire(root || document);
  }

  window.BasementToast = {
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
