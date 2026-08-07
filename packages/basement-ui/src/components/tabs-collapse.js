/**
 * Collapse `.tabs` when labels exceed available width.
 * Modes via data-tabs-overflow: "stack" (default) | "dropdown" | "off"
 * Also honors data-tabs-collapse="off".
 * Dropdown menus use BasementFloat when present (boundary via data-float-boundary).
 */
(function () {
  function useFloat() {
    return Boolean(window.BasementFloat);
  }

  function getMenu(control) {
    return (control && control.__tabsMenu) || (control && control.querySelector('.menu'));
  }

  function fitDropdownMenuHeight(control, anchor) {
    // Float.place owns height clamping when the menu is portaled.
    var menu = getMenu(control);
    if (!menu || menu.hidden || menu.classList.contains('is-float-open')) return;
    menu.style.maxHeight = '';
    menu.style.overflowY = 'visible';
    var margin = 8;
    anchor = anchor || (control && control.querySelector('.dropdown-trigger')) || control;
    if (!anchor || !anchor.getBoundingClientRect) return;
    var boundary = anchor.closest && anchor.closest('[data-float-boundary]');
    var boxTop = margin;
    var boxBottom = window.innerHeight - margin;
    if (boundary) {
      var br = boundary.getBoundingClientRect();
      boxTop = Math.max(boxTop, br.top + margin);
      boxBottom = Math.min(boxBottom, br.bottom - margin);
    }
    var ar = anchor.getBoundingClientRect();
    var spaceBelow = Math.max(0, Math.floor(boxBottom - ar.bottom - margin));
    var spaceAbove = Math.max(0, Math.floor(ar.top - boxTop - margin));
    var avail = Math.max(spaceBelow, spaceAbove);
    if (avail > 0 && menu.scrollHeight > avail) {
      menu.style.maxHeight = avail + 'px';
      menu.style.overflowY = 'auto';
    }
  }

  function closeTabsDropdown(control) {
    if (!control) return;
    var menu = getMenu(control);
    if (menu && useFloat() && menu.classList.contains('is-float-open')) {
      window.BasementFloat.close(menu);
      return;
    }
    finishCloseTabsDropdown(control, menu);
  }

  function finishCloseTabsDropdown(control, menu) {
    var trigger = control.querySelector('.dropdown-trigger');
    control.classList.remove('is-open');
    menu = menu || getMenu(control);
    if (menu) {
      menu.hidden = true;
      menu.style.maxHeight = '';
      menu.style.overflowY = '';
      menu.style.minWidth = '';
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function openTabsDropdown(control) {
    var menu = getMenu(control);
    var trigger = control.querySelector('.dropdown-trigger');
    if (!menu || !trigger) return;

    document.querySelectorAll('.tabs-dropdown-control.is-open').forEach(function (el) {
      if (el !== control) closeTabsDropdown(el);
    });

    control.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    menu.style.minWidth = Math.ceil(trigger.getBoundingClientRect().width) + 'px';
    fitDropdownMenuHeight(control, trigger);

    if (useFloat()) {
      window.BasementFloat.open({
        anchor: trigger,
        panel: menu,
        mode: 'dialog',
        onClose: function () {
          finishCloseTabsDropdown(control, menu);
        },
      });
      fitDropdownMenuHeight(control, trigger);
      window.BasementFloat.place(trigger, menu);
    }
  }

  function overflowMode(tabsEl) {
    if (tabsEl.dataset.tabsCollapse === 'off' || tabsEl.dataset.tabsOverflow === 'off') {
      return 'off';
    }
    return tabsEl.dataset.tabsOverflow || 'stack';
  }

  function syncTabsDropdown(tabsEl, show) {
    var control = tabsEl.querySelector(':scope > .tabs-dropdown-control');
    if (!show) {
      if (control) {
        closeTabsDropdown(control);
        control.remove();
      }
      tabsEl.classList.remove('tabs--dropdown');
      return;
    }
    var tabs = Array.from(tabsEl.querySelectorAll(':scope > button.tab'));
    if (!tabs.length) return;
    if (!control) {
      control = document.createElement('div');
      control.className = 'dropdown-demo tabs-dropdown-control';
      var trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'btn btn--default btn--xs dropdown-trigger';
      trigger.setAttribute('aria-haspopup', 'menu');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.innerHTML =
        '<span class="tabs-dropdown-label"></span>' +
        '<i class="ph ph-caret-down dropdown-caret--down" aria-hidden="true"></i>' +
        '<i class="ph ph-caret-up dropdown-caret--up" aria-hidden="true"></i>';
      var menu = document.createElement('div');
      menu.className = 'menu';
      menu.setAttribute('role', 'menu');
      menu.hidden = true;
      control.__tabsMenu = menu;
      control.appendChild(trigger);
      control.appendChild(menu);
      tabsEl.appendChild(control);
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (control.classList.contains('is-open')) {
          closeTabsDropdown(control);
        } else {
          openTabsDropdown(control);
        }
      });
    }
    var labelEl = control.querySelector('.tabs-dropdown-label');
    var menuEl = getMenu(control);
    if (!labelEl || !menuEl) return;
    control.__tabsMenu = menuEl;
    tabsEl.classList.add('tabs--dropdown');
    var activeIdx = Math.max(
      0,
      tabs.findIndex(function (b) {
        return b.classList.contains('is-active') || b.getAttribute('aria-selected') === 'true';
      }),
    );
    labelEl.innerHTML = (tabs[activeIdx] && tabs[activeIdx].innerHTML) || 'Select';
    menuEl.innerHTML = tabs
      .map(function (btn, i) {
        return (
          '<button type="button" class="menu-item" role="menuitem" data-tabs-dd-idx="' +
          i +
          '">' +
          '<span class="menu-item-text">' +
          btn.innerHTML +
          '</span></button>'
        );
      })
      .join('');
    menuEl.querySelectorAll('button[data-tabs-dd-idx]').forEach(function (item) {
      item.onclick = function () {
        var idx = +item.dataset.tabsDdIdx;
        var btn = tabs[idx];
        if (btn) btn.click();
        closeTabsDropdown(control);
      };
    });
  }

  function availableWidth(tabsEl) {
    // Use the parent's content box — not the tabs' shrink-wrapped self width
    // (that false-stacks) and not a % width stretch inside fit-content hosts
    // (that locks dropdown collapsed: avail ≈ need on first paint).
    var parent = tabsEl.parentElement;
    if (!parent) return tabsEl.clientWidth;

    var pcs = window.getComputedStyle(parent);
    var parentW =
      parent.clientWidth -
      (parseFloat(pcs.paddingLeft) || 0) -
      (parseFloat(pcs.paddingRight) || 0);

    // Honor absolute inline max-width only (ignore max-width: 100%).
    var maxRaw = tabsEl.style.maxWidth;
    if (maxRaw && maxRaw !== 'none' && !/%\s*$/.test(maxRaw)) {
      var probe = document.createElement('div');
      probe.style.cssText =
        'position:absolute;visibility:hidden;pointer-events:none;width:' + maxRaw;
      parent.appendChild(probe);
      var maxPx = probe.offsetWidth;
      parent.removeChild(probe);
      if (maxPx > 0) return parentW > 0 ? Math.min(parentW, maxPx) : maxPx;
    }

    return parentW || tabsEl.clientWidth;
  }

  function intrinsicTabsWidth(tabsEl) {
    // scrollWidth is unreliable with overflow:visible — sum tab boxes instead.
    // Subtract shared negative margins so need matches the shrink-wrapped row.
    var tabs = tabsEl.querySelectorAll(':scope > button.tab');
    var total = 0;
    var overlap = 0;
    for (var i = 0; i < tabs.length; i++) {
      total += tabs[i].offsetWidth;
      if (i > 0 && !tabsEl.classList.contains('tabs--underline')) {
        var cs = window.getComputedStyle(tabs[i]);
        overlap += Math.abs(parseFloat(cs.marginLeft) || 0);
      }
    }
    if (!total) return tabsEl.scrollWidth;
    return Math.max(0, total - overlap);
  }

  function syncTabsCollapse(tabsEl) {
    if (
      !tabsEl ||
      tabsEl.__tabsSyncing ||
      tabsEl.classList.contains('tabs--full') ||
      tabsEl.classList.contains('tabs--icon')
    ) {
      return;
    }

    var mode = overflowMode(tabsEl);
    if (mode === 'off') return;

    tabsEl.__tabsSyncing = true;
    try {
      // Measure in the horizontal (un-collapsed) layout. Clearing overflow
      // classes changes this element's size — watch() must not ResizeObserver
      // the tabs el itself or we stack↔unstack forever. Keep the guard through
      // rAF so any leftover observer callbacks from the parent are ignored too.
      tabsEl.classList.remove('tabs--stacked', 'tabs--dropdown');
      syncTabsDropdown(tabsEl, false);

      var avail = availableWidth(tabsEl);
      var need = Math.max(tabsEl.scrollWidth, intrinsicTabsWidth(tabsEl));
      var overflowing = need > avail + 1;

      if (mode === 'dropdown') {
        if (overflowing) syncTabsDropdown(tabsEl, true);
      } else {
        tabsEl.classList.toggle('tabs--stacked', overflowing);
      }
    } finally {
      requestAnimationFrame(function () {
        tabsEl.__tabsSyncing = false;
      });
    }
  }

  function watchTabsCollapse(tabsEl) {
    var sync = function () {
      syncTabsCollapse(tabsEl);
    };
    sync();

    if (typeof ResizeObserver !== 'undefined') {
      var observer = new ResizeObserver(sync);
      // Parent capacity is what overflow cares about. Observing the tabs el
      // re-enters on our own stacked/dropdown toggles and freezes the UI.
      if (tabsEl.parentElement) observer.observe(tabsEl.parentElement);
    }

    window.addEventListener('resize', sync);
  }

  function initTabsCollapse(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.tabs').forEach(watchTabsCollapse);
  }

  window.BasementTabs = {
    sync: syncTabsCollapse,
    watch: watchTabsCollapse,
    init: initTabsCollapse,
    fitDropdownMenuHeight: fitDropdownMenuHeight,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initTabsCollapse(document);
    });
  } else {
    initTabsCollapse(document);
  }

  document.addEventListener('click', function () {
    document.querySelectorAll('.tabs-dropdown-control.is-open').forEach(closeTabsDropdown);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.tabs-dropdown-control.is-open').forEach(closeTabsDropdown);
  });

  window.addEventListener('resize', function () {
    document.querySelectorAll('.tabs-dropdown-control.is-open').forEach(function (el) {
      fitDropdownMenuHeight(el);
    });
  });
})();
