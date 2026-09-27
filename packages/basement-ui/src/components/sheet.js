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
 *
 * Lifecycle: mount the host closed and call open(); it slides up from the bottom,
 * takes focus, and makes the content behind it inert. close() restores focus and
 * the content at once, then keeps the host in place until the slide out ends.
 * Both return a Promise that resolves true when the motion finishes, or false when
 * another open or close interrupts it; unmount only after close() resolves true.
 * With reduced motion they resolve at once. data-sheet-state on the host reads
 * opening, open, closing, or closed, and a basement-sheet event carries the same
 * value in detail.state. A host mounted with is-sheet-open still slides in where
 * @starting-style is supported, but only open() moves focus and sets inert.
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

  var reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function toMs(value) {
    var raw = String(value || '').trim();
    var n = parseFloat(raw) || 0;
    return /ms$/.test(raw) ? n : n * 1000;
  }

  /* Longest transition on the panel, delays included. */
  function motionMs(sheet) {
    if (!sheet || (reducedMotion && reducedMotion.matches)) return 0;
    var style = getComputedStyle(sheet);
    var durations = style.transitionDuration.split(',');
    var delays = style.transitionDelay.split(',');
    var max = 0;
    durations.forEach(function (duration, i) {
      var total = toMs(duration) + toMs(delays[i % delays.length]);
      if (total > max) max = total;
    });
    return max;
  }

  function setState(host, state) {
    host.setAttribute('data-sheet-state', state);
    host.dispatchEvent(new CustomEvent('basement-sheet', { bubbles: true, detail: { state: state } }));
  }

  /* Resolves true when the panel's slide ends, false if a later open or close takes over. */
  function afterMotion(host) {
    var sheet = sheetFor(host);
    var token = {};
    host.__basementSheetMotion = token;
    return new Promise(function (resolve) {
      var ms = motionMs(sheet);
      var timer = null;
      function finish() {
        if (sheet) sheet.removeEventListener('transitionend', onEnd);
        if (timer) clearTimeout(timer);
        var current = host.__basementSheetMotion === token;
        if (current) host.__basementSheetMotion = null;
        resolve(current);
      }
      function onEnd(event) {
        if (event.target === sheet && event.propertyName === 'transform') finish();
      }
      if (!ms) {
        Promise.resolve().then(finish);
        return;
      }
      sheet.addEventListener('transitionend', onEnd);
      timer = setTimeout(finish, ms + 50);
    });
  }

  /* Closing: the panel is still on screen but can no longer take focus. */
  function setExitInert(host, on) {
    if (on) {
      if (host.hasAttribute('inert')) return;
      host.setAttribute('inert', '');
      host.setAttribute('data-basement-sheet-exit', '');
    } else if (host.hasAttribute('data-basement-sheet-exit')) {
      host.removeAttribute('data-basement-sheet-exit');
      host.removeAttribute('inert');
    }
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

  function isRegionSheet(host) {
    return !!(host && host.closest && host.closest('.overlay-root'));
  }

  /* Page sheets leave the content stacking context so they cover the sidebar. */
  function park(host) {
    if (!host || isRegionSheet(host) || host.__basementSheetPark) return;
    var marker = document.createComment('sheet-host');
    if (host.parentNode) host.parentNode.insertBefore(marker, host);
    host.__basementSheetPark = marker;
    document.body.appendChild(host);
  }

  function unpark(host) {
    var marker = host && host.__basementSheetPark;
    host.__basementSheetPark = null;
    if (!marker || !marker.parentNode) return;
    marker.parentNode.insertBefore(host, marker);
    marker.parentNode.removeChild(marker);
  }

  function open(hostOrSheet) {
    var host = hostFor(hostOrSheet) || hostOrSheet;
    if (!host || !host.classList.contains('sheet-host')) return Promise.resolve(false);
    if (host.__basementSheetActive) {
      return host.__basementSheetMotion ? host.__basementSheetOpening : Promise.resolve(true);
    }
    host.__basementSheetActive = true;
    if (!host.__basementSheetWired && host.parentElement) wire(host.parentElement);
    if (host.hasAttribute('data-basement-dialog-inert')) releaseInert(host, 'data-basement-dialog-inert');
    if (host.hasAttribute('data-basement-sheet-inert')) releaseInert(host, 'data-basement-sheet-inert');
    setExitInert(host, false);
    host.__basementSheetOpener = document.activeElement;
    park(host);
    /* Commit the closed pose first, so a host just mounted or moved still slides up. */
    void host.offsetHeight;
    host.classList.add('is-sheet-open');
    setState(host, 'opening');
    syncAria(host);
    syncInert(host, true);
    focusSheet(host);
    host.__basementSheetOpening = afterMotion(host).then(function (done) {
      if (done) setState(host, 'open');
      return done;
    });
    return host.__basementSheetOpening;
  }

  function close(hostOrSheet) {
    var host = hostFor(hostOrSheet) || hostOrSheet;
    if (!host || !host.classList.contains('sheet-host')) return Promise.resolve(false);
    if (isStatic(host)) return Promise.resolve(false);
    if (!host.__basementSheetActive && !host.classList.contains('is-sheet-open')) {
      return host.__basementSheetMotion ? host.__basementSheetClosing : Promise.resolve(true);
    }
    host.__basementSheetActive = false;
    host.classList.remove('is-sheet-open');
    setState(host, 'closing');
    setExitInert(host, true);
    syncAria(host);
    syncInert(host, false);
    host.__basementSheetClosing = afterMotion(host).then(function (done) {
      if (!done) return false;
      setExitInert(host, false);
      unpark(host);
      setState(host, 'closed');
      return true;
    });
    var opener = host.__basementSheetOpener;
    host.__basementSheetOpener = null;
    if (opener && typeof opener.focus === 'function' && document.contains(opener)) {
      try {
        opener.focus({ preventScroll: true });
      } catch (e) {
        opener.focus();
      }
    }
    /* No opener to return to: never leave focus inside the closing panel. */
    var active = document.activeElement;
    if (active && active !== document.body && host.contains(active) && typeof active.blur === 'function') active.blur();
    return host.__basementSheetClosing;
  }

  function toggle(hostOrSheet) {
    var host = hostFor(hostOrSheet) || hostOrSheet;
    if (!host || !host.classList.contains('sheet-host')) return Promise.resolve(false);
    return host.__basementSheetActive || host.classList.contains('is-sheet-open') ? close(host) : open(host);
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
      if (!host.hasAttribute('data-sheet-state')) {
        host.setAttribute('data-sheet-state', host.classList.contains('is-sheet-open') ? 'open' : 'closed');
      }
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
