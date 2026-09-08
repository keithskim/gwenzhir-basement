/**
 * Dropdown — trigger + floating Menu panel.
 *
 * Markup:
 *   <div class="dropdown">
 *     <button type="button" class="dropdown-trigger" aria-expanded="false" aria-haspopup="menu">
 *       Open
 *       <i class="ph ph-caret-down dropdown-caret--down" aria-hidden="true"></i>
 *       <i class="ph ph-caret-up dropdown-caret--up" aria-hidden="true"></i>
 *     </button>
 *     <div class="menu" role="menu" hidden>…</div>
 *   </div>
 *
 * Placement: `dropdown--end` / `dropdown--center`, or `data-dropdown-align="end|center"`.
 * Opt out of auto-init with `data-dropdown="off"`. Tabs overflow owns its own control.
 * Uses BasementFloat when present (boundary via data-float-boundary).
 */
(function () {
  var ITEM_SEL = '.menu-item, [role="menuitem"]';
  var uid = 0;
  var openRoots = new Set();

  function useFloat() {
    return Boolean(window.BasementFloat);
  }

  function isTabsControl(el) {
    return !!(el && el.classList && el.classList.contains('tabs-dropdown-control'));
  }

  function getTrigger(root) {
    return root.querySelector(':scope > .dropdown-trigger') || root.querySelector('.dropdown-trigger');
  }

  function getPanel(root) {
    return (
      root._dropdownPanel ||
      root.querySelector(':scope > .menu') ||
      root.querySelector('.menu')
    );
  }

  function items(panel) {
    if (!panel) return [];
    return Array.prototype.filter.call(panel.querySelectorAll(ITEM_SEL), function (el) {
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
      if (el.hidden || el.closest('[hidden]')) return false;
      return true;
    });
  }

  function alignOf(root) {
    var data = root.getAttribute('data-dropdown-align');
    if (data === 'end' || data === 'center' || data === 'start') return data;
    if (root.classList.contains('dropdown--end')) return 'end';
    if (root.classList.contains('dropdown--center')) return 'center';
    return 'start';
  }

  function popupType() {
    return 'menu';
  }

  function ensureIds(root, trigger, panel) {
    if (!trigger.id) {
      uid += 1;
      trigger.id = 'basement-dropdown-trigger-' + uid;
    }
    if (!panel.id) {
      uid += 1;
      panel.id = 'basement-dropdown-' + uid;
    }
    if (!trigger.getAttribute('aria-controls')) {
      trigger.setAttribute('aria-controls', panel.id);
    }
    if (!panel.getAttribute('aria-labelledby')) {
      panel.setAttribute('aria-labelledby', trigger.id);
    }
  }

  function isOpen(root) {
    return !!(root && root.classList.contains('is-open'));
  }

  function finishClose(root, panel, trigger, restoreFocus) {
    var wasOpen = isOpen(root);
    root.classList.remove('is-open');
    openRoots.delete(root);
    panel = panel || getPanel(root);
    trigger = trigger || getTrigger(root);
    if (panel) {
      panel.hidden = true;
      panel.style.maxHeight = '';
      panel.style.overflowY = '';
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus && wasOpen && trigger) trigger.focus();
  }

  function close(root, opts) {
    if (!root || isTabsControl(root)) return;
    opts = opts || {};
    var panel = getPanel(root);
    var trigger = getTrigger(root);
    if (panel && useFloat() && panel.classList.contains('is-float-open')) {
      root._dropdownRestoreFocus = !!opts.restoreFocus;
      window.BasementFloat.close(panel);
      return;
    }
    finishClose(root, panel, trigger, opts.restoreFocus);
  }

  function closeAll(except, opts) {
    Array.from(openRoots).forEach(function (root) {
      if (root === except) return;
      close(root, opts);
    });
  }

  function focusItem(list, index) {
    if (!list.length) return;
    var i = index % list.length;
    if (i < 0) i += list.length;
    list[i].focus();
  }

  function columnSections(item) {
    var grid = item.closest('.menu-grid');
    var section = item.closest('.menu-section');
    if (!grid || !section || section.parentElement !== grid) return null;
    return {
      grid: grid,
      section: section,
      sections: Array.prototype.slice.call(grid.querySelectorAll(':scope > .menu-section')),
    };
  }

  function moveColumn(item, dir) {
    var cols = columnSections(item);
    if (!cols) return null;
    var si = cols.sections.indexOf(cols.section);
    var next = cols.sections[si + dir];
    if (!next) return item;
    var fromItems = items(cols.section);
    var toItems = items(next);
    if (!toItems.length) return item;
    var idx = fromItems.indexOf(item);
    return toItems[Math.min(Math.max(idx, 0), toItems.length - 1)] || toItems[0];
  }

  function open(root, opts) {
    if (!root || isTabsControl(root)) return;
    opts = opts || {};
    var trigger = getTrigger(root);
    var panel = getPanel(root);
    if (!trigger || !panel) return;
    if (isOpen(root)) {
      if (opts.focus === 'first') focusItem(items(panel), 0);
      if (opts.focus === 'last') {
        var list = items(panel);
        focusItem(list, list.length - 1);
      }
      return;
    }

    closeAll(root);
    if (window.BasementDatetime) window.BasementDatetime.closeAll();

    ensureIds(root, trigger, panel);
    if (!trigger.getAttribute('aria-haspopup')) {
      trigger.setAttribute('aria-haspopup', popupType());
    }

    root.classList.add('is-open');
    openRoots.add(root);
    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    root._dropdownPanel = panel;

    if (useFloat()) {
      window.BasementFloat.open({
        anchor: trigger,
        panel: panel,
        mode: 'dialog',
        align: alignOf(root),
        onClose: function () {
          var restore = !!root._dropdownRestoreFocus;
          root._dropdownRestoreFocus = false;
          finishClose(root, panel, trigger, restore);
        },
      });
    }

    if (opts.focus === 'first') focusItem(items(panel), 0);
    if (opts.focus === 'last') {
      var last = items(panel);
      focusItem(last, last.length - 1);
    }
  }

  function toggle(root, opts) {
    if (isOpen(root)) close(root, opts);
    else open(root, opts);
  }

  function onPanelKeydown(root, event) {
    var panel = getPanel(root);
    var list = items(panel);
    if (!list.length) return;
    var current = event.target.closest(ITEM_SEL);
    var index = current ? list.indexOf(current) : -1;
    var next = null;

    if (event.key === 'Escape') {
      event.preventDefault();
      close(root, { restoreFocus: true });
      return;
    }
    if (event.key === 'Tab' && current) {
      if (!event.shiftKey && current === list[list.length - 1]) {
        event.preventDefault();
        close(root, { restoreFocus: true });
        return;
      }
      if (event.shiftKey && current === list[0]) {
        var trigger = getTrigger(root);
        if (trigger) {
          event.preventDefault();
          trigger.focus();
        }
        return;
      }
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      next = list[(index + 1) % list.length];
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      next = list[(index - 1 + list.length) % list.length];
    } else if (event.key === 'Home') {
      event.preventDefault();
      next = list[0];
    } else if (event.key === 'End') {
      event.preventDefault();
      next = list[list.length - 1];
    } else if (event.key === 'ArrowRight') {
      next = current && moveColumn(current, 1);
      if (next) event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      next = current && moveColumn(current, -1);
      if (next) event.preventDefault();
    }

    if (next) next.focus();
  }

  function onTriggerKeydown(root, event) {
    if (event.key === 'Escape' && isOpen(root)) {
      event.preventDefault();
      close(root, { restoreFocus: true });
      return;
    }
    if (event.key === 'Tab' && isOpen(root) && !event.shiftKey) {
      var tabItems = items(getPanel(root));
      if (!tabItems.length) return;
      event.preventDefault();
      tabItems[0].focus();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      open(root, { focus: 'first' });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      open(root, { focus: 'last' });
    }
  }

  function wire(root) {
    if (!root || root.dataset.basementDropdown) return;
    if (root.getAttribute('data-dropdown') === 'off') return;
    if (isTabsControl(root)) return;
    var trigger = getTrigger(root);
    var panel = getPanel(root);
    if (!trigger || !panel) return;

    root.dataset.basementDropdown = '1';
    root._dropdownPanel = panel;
    ensureIds(root, trigger, panel);
    if (!trigger.hasAttribute('aria-expanded')) {
      trigger.setAttribute('aria-expanded', 'false');
    }
    if (!trigger.getAttribute('aria-haspopup')) {
      trigger.setAttribute('aria-haspopup', popupType());
    }
    if (!panel.hasAttribute('hidden') && !isOpen(root)) {
      panel.hidden = true;
    }

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      toggle(root);
    });

    trigger.addEventListener('keydown', function (event) {
      onTriggerKeydown(root, event);
    });

    panel.addEventListener('keydown', function (event) {
      onPanelKeydown(root, event);
    });

    panel.addEventListener('click', function (event) {
      var item = event.target.closest(ITEM_SEL);
      if (!item || !panel.contains(item)) return;
      if (item.closest('[data-dropdown-keep-open]')) return;
      var isLink = item.tagName === 'A' && item.getAttribute('href');
      close(root, { restoreFocus: !isLink });
    });

    root.addEventListener('focusout', function () {
      requestAnimationFrame(function () {
        if (!isOpen(root)) return;
        var active = document.activeElement;
        var p = getPanel(root);
        var t = getTrigger(root);
        if (root.contains(active)) return;
        if (p && p.contains(active)) return;
        if (t && t.contains(active)) return;
        close(root);
      });
    });
  }

  function init(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.dropdown, .dropdown-demo').forEach(wire);
  }

  document.addEventListener('pointerdown', function (event) {
    if (!openRoots.size) return;
    Array.from(openRoots).forEach(function (root) {
      var panel = getPanel(root);
      var trigger = getTrigger(root);
      if (root.contains(event.target)) return;
      if (panel && panel.contains(event.target)) return;
      if (trigger && (trigger === event.target || trigger.contains(event.target))) return;
      close(root);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape' || !openRoots.size) return;
    Array.from(openRoots).forEach(function (root) {
      close(root, { restoreFocus: true });
    });
  });

  window.BasementDropdown = {
    init: init,
    wire: wire,
    open: open,
    close: close,
    closeAll: closeAll,
    isOpen: isOpen,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init(document);
    });
  } else {
    init(document);
  }
})();
