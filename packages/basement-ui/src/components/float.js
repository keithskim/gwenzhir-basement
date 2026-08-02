/**
 * Overflow-safe floating panels — portal to body with flip/shift placement.
 * Dialog mode locks scroll parents; tooltip mode closes on scroll.
 */
(function () {
  var floatState = new WeakMap();
  var openFloatPanels = new Set();
  var FLOAT_GAP = 8;
  var FLOAT_MARGIN = 8;

  function scrollParents(el) {
    var out = [];
    for (var n = el && el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      var s = getComputedStyle(n);
      if (/(auto|scroll|overlay)/.test(s.overflow + s.overflowY + s.overflowX)) {
        out.push(n);
      }
    }
    return out;
  }

  /** Viewport box, optionally tightened to [data-float-boundary] around the anchor. */
  function clampBox(anchor) {
    var left = FLOAT_MARGIN;
    var top = FLOAT_MARGIN;
    var right = window.innerWidth - FLOAT_MARGIN;
    var bottom = window.innerHeight - FLOAT_MARGIN;
    var boundary =
      anchor && anchor.closest ? anchor.closest('[data-float-boundary]') : null;
    if (boundary) {
      var br = boundary.getBoundingClientRect();
      left = Math.max(left, br.left + FLOAT_MARGIN);
      top = Math.max(top, br.top + FLOAT_MARGIN);
      right = Math.min(right, br.right - FLOAT_MARGIN);
      bottom = Math.min(bottom, br.bottom - FLOAT_MARGIN);
    }
    return { left: left, top: top, right: right, bottom: bottom };
  }

  function place(anchor, panel) {
    panel.style.position = 'fixed';
    panel.style.visibility = 'hidden';
    panel.style.left = '0';
    panel.style.top = '0';
    var ar = anchor.getBoundingClientRect();
    var pr = panel.getBoundingClientRect();
    var pw = pr.width;
    var ph = pr.height;
    var box = clampBox(anchor);
    var top = ar.bottom + FLOAT_GAP;
    if (top + ph > box.bottom && ar.top - FLOAT_GAP - ph >= box.top) {
      top = ar.top - FLOAT_GAP - ph;
    } else {
      top = Math.min(top, box.bottom - ph);
      top = Math.max(box.top, top);
    }
    var left = ar.left;
    left = Math.min(left, box.right - pw);
    left = Math.max(box.left, left);
    panel.style.top = top + 'px';
    panel.style.left = left + 'px';
    panel.style.zIndex = '1000';
    panel.style.visibility = '';
  }

  function open(opts) {
    var anchor = opts.anchor;
    var panel = opts.panel;
    var mode = opts.mode || 'dialog';
    var onClose = opts.onClose || null;
    if (floatState.has(panel)) close(panel);
    var parent = panel.parentNode;
    var next = panel.nextSibling;
    var state = {
      parent: parent,
      next: next,
      mode: mode,
      anchor: anchor,
      locked: [],
      onScroll: null,
      onResize: null,
      onClose: onClose,
    };
    document.body.appendChild(panel);
    panel.hidden = false;
    panel.classList.add('is-float-open');
    place(anchor, panel);
    if (mode === 'dialog') {
      scrollParents(anchor).forEach(function (sp) {
        state.locked.push({
          el: sp,
          overflow: sp.style.overflow,
          overflowY: sp.style.overflowY,
          overflowX: sp.style.overflowX,
        });
        sp.style.overflow = 'hidden';
        sp.style.overflowY = 'hidden';
        sp.style.overflowX = 'hidden';
      });
    } else {
      state.onScroll = function () {
        close(panel);
      };
      window.addEventListener('scroll', state.onScroll, true);
    }
    state.onResize = function () {
      if (floatState.has(panel)) place(anchor, panel);
    };
    window.addEventListener('resize', state.onResize);
    floatState.set(panel, state);
    openFloatPanels.add(panel);
  }

  function close(panel) {
    var state = floatState.get(panel);
    if (!state) return;
    floatState.delete(panel);
    openFloatPanels.delete(panel);
    state.locked.forEach(function (L) {
      L.el.style.overflow = L.overflow;
      L.el.style.overflowY = L.overflowY;
      L.el.style.overflowX = L.overflowX;
    });
    if (state.onScroll) window.removeEventListener('scroll', state.onScroll, true);
    if (state.onResize) window.removeEventListener('resize', state.onResize);
    panel.classList.remove('is-float-open');
    panel.style.position = '';
    panel.style.top = '';
    panel.style.left = '';
    panel.style.zIndex = '';
    panel.style.visibility = '';
    if (state.parent) {
      if (state.next && state.next.parentNode === state.parent) {
        state.parent.insertBefore(panel, state.next);
      } else {
        state.parent.appendChild(panel);
      }
    }
    if (state.onClose) state.onClose();
  }

  function closeAll() {
    Array.from(openFloatPanels).forEach(close);
  }

  document.addEventListener('pointerdown', function (event) {
    if (!openFloatPanels.size) return;
    Array.from(openFloatPanels).forEach(function (panel) {
      var state = floatState.get(panel);
      if (!state || state.mode !== 'dialog') return;
      if (panel.contains(event.target)) return;
      if (state.anchor && (state.anchor === event.target || state.anchor.contains(event.target))) {
        return;
      }
      close(panel);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && openFloatPanels.size) {
      closeAll();
    }
  });

  window.BasementFloat = {
    open: open,
    close: close,
    closeAll: closeAll,
    place: place,
  };
})();
