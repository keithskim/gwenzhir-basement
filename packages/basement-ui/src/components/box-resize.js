/**
 * Resizable Box — drag the end-edge handle to change width within clamps.
 *
 * Markup:
 *   <div class="box box--resizable" data-box-min-width="20rem" data-box-max-width="100%">
 *     …
 *     <button type="button" class="box-resize-handle" aria-label="Resize"></button>
 *   </div>
 */
(function () {
  function parseLength(value, percentBase) {
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

  function parentWidth(el) {
    var parent = el.parentElement;
    return parent ? parent.getBoundingClientRect().width : window.innerWidth;
  }

  function clampWidth(el, widthPx) {
    var base = parentWidth(el);
    var minAttr = el.getAttribute('data-box-min-width') || '16rem';
    var maxAttr = el.getAttribute('data-box-max-width') || '100%';
    var min = parseLength(minAttr, base);
    var max = parseLength(maxAttr, base);
    if (min == null) min = 0;
    if (max == null) max = base;
    max = Math.min(max, base);
    return Math.max(min, Math.min(max, widthPx));
  }

  function keyStepPx() {
    var root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return root / 2;
  }

  function syncResizeAria(el, handle) {
    if (!handle) return;
    var base = parentWidth(el);
    var min = parseLength(el.getAttribute('data-box-min-width') || '16rem', base);
    var max = parseLength(el.getAttribute('data-box-max-width') || '100%', base);
    if (min == null) min = 0;
    if (max == null) max = base;
    max = Math.min(max, base);
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-orientation', 'vertical');
    handle.setAttribute('aria-valuemin', String(Math.round(min)));
    handle.setAttribute('aria-valuemax', String(Math.round(max)));
    handle.setAttribute('aria-valuenow', String(Math.round(el.getBoundingClientRect().width)));
  }

  function setBoxWidth(el, handle, widthPx) {
    var next = clampWidth(el, widthPx);
    el.style.width = next + 'px';
    syncResizeAria(el, handle);
    return next;
  }

  function ensureHandle(el) {
    var handle = el.querySelector(':scope > .box-resize-handle');
    if (handle) return handle;
    handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'box-resize-handle';
    handle.setAttribute('aria-label', 'Resize');
    el.appendChild(handle);
    return handle;
  }

  function wire(el) {
    if (!el || el.__basementBoxResize) return;
    el.__basementBoxResize = true;
    el.classList.add('box--resizable');
    var handle = ensureHandle(el);
    syncResizeAria(el, handle);

    handle.addEventListener('pointerdown', function (event) {
      if (event.button != null && event.button !== 0) return;
      event.preventDefault();
      var startX = event.clientX;
      var startW = el.getBoundingClientRect().width;
      el.classList.add('is-resizing');
      handle.setPointerCapture(event.pointerId);

      var onMove = function (ev) {
        setBoxWidth(el, handle, startW + (ev.clientX - startX));
      };
      var onUp = function (ev) {
        el.classList.remove('is-resizing');
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

    handle.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      var step = keyStepPx();
      var current = el.getBoundingClientRect().width;
      var delta = event.key === 'ArrowRight' ? step : -step;
      setBoxWidth(el, handle, current + delta);
    });
  }

  function init(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.box--resizable').forEach(wire);
  }

  window.BasementBox = {
    init: init,
    wire: wire,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init(document);
    });
  } else {
    init(document);
  }
})();
