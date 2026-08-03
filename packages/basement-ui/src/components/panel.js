/**
 * Panel — left/right chrome with resize handle and optional drawer.
 *
 * Markup:
 *   <div class="panel-host">
 *     <aside id="nav" class="panel panel--left panel--drawer panel--resizable">
 *       …
 *       <button type="button" class="panel-close" aria-label="Close">…</button>
 *       <button type="button" class="panel-resize-handle" aria-label="Resize"></button>
 *     </aside>
 *     <main>
 *       <button type="button" class="panel-toggle panel-toggle--left" data-panel-toggle="nav">…</button>
 *     </main>
 *     <aside id="detail" class="panel panel--right panel--drawer panel--resizable">…</aside>
 *     <div class="panel-backdrop" aria-hidden="true"></div>
 *   </div>
 *
 * Add panel--drawer-full for a host-covering drawer (default is a defined slide-in width).
 */
(function () {
  var DRAWER_FALLBACK_PX = 600;

  function hostFor(panel) {
    return (
      panel.closest('.panel-host, .app-frame') ||
      panel.parentElement ||
      document.body
    );
  }

  function isRight(panel) {
    return panel.classList.contains('panel--right');
  }

  function drawerBreakpointPx(panel) {
    var raw = getComputedStyle(panel).getPropertyValue('--panel-drawer-at').trim();
    if (!raw) {
      raw = getComputedStyle(hostFor(panel))
        .getPropertyValue(isRight(panel) ? '--panel-drawer-at-right' : '--panel-drawer-at-left')
        .trim();
    }
    if (!raw) return isRight(panel) ? 900 : DRAWER_FALLBACK_PX;
    if (raw.endsWith('rem')) {
      var root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      return parseFloat(raw) * root;
    }
    var num = parseFloat(raw);
    return Number.isNaN(num) ? (isRight(panel) ? 900 : DRAWER_FALLBACK_PX) : num;
  }

  function isDrawerWidth(panel) {
    return hostFor(panel).getBoundingClientRect().width <= drawerBreakpointPx(panel) + 0.5;
  }

  function parseCssLength(value, percentBase) {
    if (value == null || value === '') return null;
    var str = String(value).trim();
    var num = parseFloat(str);
    if (Number.isNaN(num)) return null;
    if (str.endsWith('%')) return (num / 100) * percentBase;
    if (str.endsWith('rem')) {
      var root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      return num * root;
    }
    return num;
  }

  function clampPanelWidth(panel, widthPx) {
    var hostW = hostFor(panel).getBoundingClientRect().width;
    var cs = getComputedStyle(panel);
    var min = parseCssLength(cs.getPropertyValue('--panel-min-width'), hostW);
    var max = parseCssLength(cs.getPropertyValue('--panel-max-width'), hostW);
    if (min == null) min = 0;
    if (max == null) max = Infinity;
    max = Math.min(max, hostW);
    return Math.max(min, Math.min(max, widthPx));
  }

  function syncToggleAria(panel) {
    var id = panel.id;
    if (!id) return;
    var open = panel.classList.contains('is-open');
    document.querySelectorAll('[data-panel-toggle]').forEach(function (btn) {
      var target = btn.getAttribute('data-panel-toggle') || btn.getAttribute('aria-controls');
      if (!target) return;
      target = target.replace(/^#/, '');
      if (target !== id) return;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function panelsForHost(host) {
    if (!host) return [];
    return Array.prototype.slice.call(host.querySelectorAll('.panel--drawer')).filter(function (panel) {
      return hostFor(panel) === host;
    });
  }

  function syncHostOpen(host) {
    if (!host) return;
    var anyOpen = panelsForHost(host).some(function (panel) {
      return panel.classList.contains('is-open');
    });
    host.classList.toggle('is-panel-open', anyOpen);
  }

  function open(panel) {
    if (!panel) return;
    panel.classList.add('is-open');
    syncToggleAria(panel);
    syncHostOpen(hostFor(panel));
  }

  function close(panel) {
    if (!panel) return;
    panel.classList.remove('is-open');
    syncToggleAria(panel);
    syncHostOpen(hostFor(panel));
  }

  function toggle(panel) {
    if (!panel) return;
    if (panel.classList.contains('is-open')) close(panel);
    else open(panel);
  }

  function ensureResizeHandle(panel) {
    var handle = panel.querySelector(':scope > .panel-resize-handle');
    if (handle) return handle;
    handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'panel-resize-handle';
    handle.setAttribute('aria-label', 'Resize panel');
    panel.appendChild(handle);
    return handle;
  }

  function wireResize(panel) {
    if (!panel || !panel.classList.contains('panel--resizable') || panel.__basementPanelResize) {
      return;
    }
    panel.__basementPanelResize = true;
    var handle = ensureResizeHandle(panel);
    var right = isRight(panel);

    handle.addEventListener('pointerdown', function (event) {
      if (event.button != null && event.button !== 0) return;
      /* Only block resize when this panel is actually in drawer mode */
      if (panel.classList.contains('panel--drawer') && isDrawerWidth(panel)) return;
      event.preventDefault();
      var startX = event.clientX;
      var startW = panel.getBoundingClientRect().width;
      panel.classList.add('is-resizing');
      handle.setPointerCapture(event.pointerId);

      var onMove = function (ev) {
        var delta = ev.clientX - startX;
        var next = clampPanelWidth(panel, startW + (right ? -delta : delta));
        panel.style.width = next + 'px';
      };
      var onUp = function (ev) {
        panel.classList.remove('is-resizing');
        try {
          handle.releasePointerCapture(ev.pointerId);
        } catch (err) {
          /* already released */
        }
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
      };

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    });
  }

  function wireDrawer(panel) {
    if (!panel || !panel.classList.contains('panel--drawer') || panel.__basementPanelDrawer) {
      return;
    }
    panel.__basementPanelDrawer = true;
    var host = hostFor(panel);
    var id = panel.id;

    function syncWide() {
      if (!isDrawerWidth(panel)) close(panel);
    }

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(syncWide).observe(host);
    } else {
      window.addEventListener('resize', syncWide);
    }

    if (id) {
      document.querySelectorAll('[data-panel-toggle]').forEach(function (btn) {
        var target = btn.getAttribute('data-panel-toggle') || btn.getAttribute('aria-controls');
        if (!target) return;
        target = target.replace(/^#/, '');
        if (target !== id) return;
        if (!btn.getAttribute('aria-controls')) btn.setAttribute('aria-controls', id);
        btn.addEventListener('click', function () {
          toggle(panel);
        });
        syncToggleAria(panel);
      });
    }

    panel.querySelectorAll('.panel-close').forEach(function (btn) {
      btn.addEventListener('click', function () {
        close(panel);
      });
    });

    var backdrop = host.querySelector(':scope > .panel-backdrop');
    if (backdrop && !backdrop.__basementPanelBackdrop) {
      backdrop.__basementPanelBackdrop = true;
      backdrop.addEventListener('click', function () {
        panelsForHost(host).forEach(close);
      });
    }

    syncWide();
    syncHostOpen(host);
  }

  function wireNavFade(panel) {
    if (!panel || !window.BasementEdgeFade) return;
    panel.querySelectorAll('.sidebar-nav').forEach(function (nav) {
      window.BasementEdgeFade.wire(nav, 'y');
    });
  }

  function wire(panel) {
    if (!panel) return;
    wireResize(panel);
    wireDrawer(panel);
    wireNavFade(panel);
  }

  function init(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.panel').forEach(wire);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.panel--drawer.is-open').forEach(close);
  });

  window.BasementPanel = {
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
