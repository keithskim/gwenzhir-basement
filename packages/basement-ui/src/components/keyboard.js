/**
 * Keyboard layer — Return activates checkboxes, radios, and switches.
 * Tab order and button/link Enter stay native.
 * Table wraps get a sticky focus ring that stays on the scrollport.
 */
(function () {
  var EDITABLE_TYPES = {
    text: true,
    search: true,
    email: true,
    password: true,
    number: true,
    url: true,
    tel: true,
    date: true,
    datetime: true,
    'datetime-local': true,
    month: true,
    week: true,
    time: true,
    color: true,
    file: true,
    range: true,
  };

  var wired = false;
  var tableRingResizeObs = null;

  function isDisabled(el) {
    if (!el) return true;
    if (el.disabled) return true;
    if (el.getAttribute && el.getAttribute('aria-disabled') === 'true') return true;
    if (el.closest && el.closest('[disabled], [aria-disabled="true"]')) return true;
    return false;
  }

  function isEditable(el) {
    if (!el) return false;
    var tag = el.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    if (tag === 'INPUT') {
      var type = (el.type || 'text').toLowerCase();
      return !!EDITABLE_TYPES[type];
    }
    return false;
  }

  function isNativeEnterActivator(el) {
    var tag = el.tagName;
    if (tag === 'BUTTON') return true;
    if (tag === 'A' && el.hasAttribute('href')) return true;
    if (tag === 'SUMMARY') return true;
    if (tag === 'INPUT') {
      var type = (el.type || '').toLowerCase();
      return type === 'submit' || type === 'button' || type === 'image' || type === 'reset';
    }
    return false;
  }

  function isToggle(el) {
    if (!el || el.tagName !== 'INPUT') return false;
    var type = (el.type || '').toLowerCase();
    return type === 'checkbox' || type === 'radio';
  }

  function onKeydown(event) {
    if (event.key !== 'Enter') return;
    if (event.defaultPrevented || event.isComposing) return;
    var el = event.target;
    if (!el || el.nodeType !== 1) return;
    if (isDisabled(el) || isEditable(el) || isNativeEnterActivator(el)) return;
    if (!isToggle(el)) return;
    event.preventDefault();
    el.click();
  }

  function syncTableScrollport(wrap) {
    wrap.style.setProperty('--table-scrollport-height', wrap.clientHeight + 'px');
    wrap.style.setProperty(
      '--table-ring-inline',
      getComputedStyle(wrap).paddingInlineStart
    );
    var sticky = wrap.querySelector(':scope > .table--sticky');
    var head = sticky && sticky.tHead;
    var foot = sticky && sticky.tFoot;
    wrap.style.setProperty('--table-sticky-head', head ? head.offsetHeight + 'px' : '0px');
    wrap.style.setProperty('--table-sticky-foot', foot ? foot.offsetHeight + 'px' : '0px');
  }

  function ensureTableFocusRing(wrap) {
    if (!wrap || !wrap.querySelector) return;
    if (!wrap.querySelector(':scope > .table-focus-ring')) {
      var ring = document.createElement('div');
      ring.className = 'table-focus-ring';
      ring.setAttribute('aria-hidden', 'true');
      wrap.insertBefore(ring, wrap.firstChild);
    }
    syncTableScrollport(wrap);
    if (wrap.__basementTableRingObserved || typeof ResizeObserver !== 'function') return;
    wrap.__basementTableRingObserved = true;
    if (!tableRingResizeObs) {
      tableRingResizeObs = new ResizeObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          syncTableScrollport(entries[i].target);
        }
      });
    }
    tableRingResizeObs.observe(wrap);
  }

  function wireTableWraps(root) {
    var wraps = (root || document).querySelectorAll('.table-wrap');
    for (var i = 0; i < wraps.length; i++) ensureTableFocusRing(wraps[i]);
  }

  function onFocusIn(event) {
    var t = event.target;
    if (!t || !t.classList || !t.classList.contains('table-wrap')) return;
    ensureTableFocusRing(t);
  }

  function init() {
    if (wired) return;
    wired = true;
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('focusin', onFocusIn);
    wireTableWraps(document);
  }

  window.BasementKeyboard = { init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
