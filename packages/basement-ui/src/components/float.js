/**
 * Overflow-safe floating panels — portal to body with flip/shift placement.
 * Dialog mode locks nested scroll parents and re-places on page scroll/resize;
 * tooltip mode closes on scroll.
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
    // Measure natural size, then shrink to the side that keeps the panel
    // adjacent to the anchor (never slide over the trigger when space tightens).
    panel.style.maxHeight = '';
    panel.style.overflowY = '';
    var ar = anchor.getBoundingClientRect();
    var pr = panel.getBoundingClientRect();
    var pw = pr.width;
    var naturalH = Math.max(pr.height, panel.scrollHeight);
    var box = clampBox(anchor);
    var spaceBelow = Math.max(0, box.bottom - (ar.bottom + FLOAT_GAP));
    var spaceAbove = Math.max(0, ar.top - FLOAT_GAP - box.top);
    var placeBelow = true;
    if (naturalH <= spaceBelow) {
      placeBelow = true;
    } else if (naturalH <= spaceAbove) {
      placeBelow = false;
    } else {
      placeBelow = spaceBelow >= spaceAbove;
    }
    var avail = placeBelow ? spaceBelow : spaceAbove;
    // Only menus shrink+scroll. Fixed-layout popups (datetime) flip/shift instead —
    // max-height + overflow breaks their grids.
    var shrinkable = panel.classList.contains('menu');
    if (shrinkable && avail > 0 && naturalH > avail) {
      panel.style.maxHeight = Math.floor(avail) + 'px';
      panel.style.overflowY = 'auto';
      pr = panel.getBoundingClientRect();
      pw = pr.width;
    }
    var ph = shrinkable ? panel.getBoundingClientRect().height : naturalH;
    if (!shrinkable && naturalH > avail && avail > 0) {
      // Still prefer the roomier side; allow painting past the boundary edge
      // rather than covering the anchor or crushing the layout.
      ph = naturalH;
    }
    var top = placeBelow ? ar.bottom + FLOAT_GAP : ar.top - FLOAT_GAP - ph;
    var left = ar.left;
    left = Math.min(left, box.right - pw);
    left = Math.max(box.left, left);
    panel.style.top = top + 'px';
    panel.style.left = left + 'px';
    panel.style.zIndex = '1000';
    panel.style.visibility = '';
  }

  function schedulePlace(state, anchor, panel) {
    if (state._placeRaf) return;
    state._placeRaf = requestAnimationFrame(function () {
      state._placeRaf = 0;
      if (floatState.has(panel)) place(anchor, panel);
    });
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
      _placeRaf: 0,
    };
    document.body.appendChild(panel);
    panel.hidden = false;
    panel.classList.add('is-float-open');
    floatState.set(panel, state);
    openFloatPanels.add(panel);
    place(anchor, panel);
    if (mode === 'dialog') {
      // Lock nested scrollers so the anchor doesn’t drift under a clipped pane.
      // Document/window scroll is left alone — re-place instead so the panel
      // stays glued to the trigger (Tabs overflow menus, long reference pages).
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
      state.onScroll = function (event) {
        if (!floatState.has(panel)) return;
        // Ignore scrolling inside the panel itself (e.g. tall menus).
        if (event && event.target && panel.contains(event.target)) return;
        schedulePlace(state, anchor, panel);
      };
      window.addEventListener('scroll', state.onScroll, true);
    } else {
      state.onScroll = function () {
        close(panel);
      };
      window.addEventListener('scroll', state.onScroll, true);
    }
    state.onResize = function () {
      schedulePlace(state, anchor, panel);
    };
    window.addEventListener('resize', state.onResize);
  }

  function close(panel) {
    var state = floatState.get(panel);
    if (!state) return;
    floatState.delete(panel);
    openFloatPanels.delete(panel);
    if (state._placeRaf) {
      cancelAnimationFrame(state._placeRaf);
      state._placeRaf = 0;
    }
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
    panel.style.maxHeight = '';
    panel.style.overflowY = '';
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
