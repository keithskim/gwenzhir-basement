/**
 * Collapse `.tabs` when labels exceed available width.
 * Modes via data-tabs-overflow: "stack" (default) | "dropdown" | "off"
 * Also honors data-tabs-collapse="off".
 */
(function () {
  function fitDropdownMenuHeight(control) {
    var menu = control && control.querySelector('.menu');
    if (!menu || menu.hidden) return;
    menu.style.maxHeight = '';
    menu.style.overflowY = 'visible';
    var margin = 8;
    var rect = menu.getBoundingClientRect();
    var avail = Math.floor(window.innerHeight - rect.top - margin);
    if (avail <= 0) return;
    var need = menu.scrollHeight;
    if (need > avail) {
      menu.style.maxHeight = Math.max(96, avail) + 'px';
      menu.style.overflowY = 'auto';
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
    var close = function () {
      if (!control) return;
      control.classList.remove('is-open');
      var menu = control.querySelector('.menu');
      if (menu) menu.hidden = true;
    };
    if (!show) {
      if (control) {
        close();
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
      trigger.innerHTML =
        '<span class="tabs-dropdown-label"></span>' +
        '<i class="ph ph-caret-down dropdown-caret--down" aria-hidden="true"></i>' +
        '<i class="ph ph-caret-up dropdown-caret--up" aria-hidden="true"></i>';
      var menu = document.createElement('div');
      menu.className = 'menu';
      menu.setAttribute('role', 'menu');
      menu.hidden = true;
      control.appendChild(trigger);
      control.appendChild(menu);
      tabsEl.appendChild(control);
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var willOpen = !control.classList.contains('is-open');
        document.querySelectorAll('.tabs-dropdown-control.is-open').forEach(function (el) {
          el.classList.remove('is-open');
          var m = el.querySelector('.menu');
          if (m) m.hidden = true;
        });
        control.classList.toggle('is-open', willOpen);
        menu.hidden = !willOpen;
        if (willOpen) fitDropdownMenuHeight(control);
      });
    }
    var labelEl = control.querySelector('.tabs-dropdown-label');
    var menuEl = control.querySelector('.menu');
    if (!labelEl || !menuEl) return;
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
        close();
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
      tabsEl.__tabsSyncing = false;
    }
  }

  function watchTabsCollapse(tabsEl) {
    var sync = function () {
      syncTabsCollapse(tabsEl);
    };
    sync();

    if (typeof ResizeObserver !== 'undefined') {
      var observer = new ResizeObserver(sync);
      observer.observe(tabsEl);
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
    document.querySelectorAll('.tabs-dropdown-control.is-open').forEach(function (el) {
      el.classList.remove('is-open');
      var m = el.querySelector('.menu');
      if (m) m.hidden = true;
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.tabs-dropdown-control.is-open').forEach(function (el) {
      el.classList.remove('is-open');
      var m = el.querySelector('.menu');
      if (m) m.hidden = true;
    });
  });

  window.addEventListener('resize', function () {
    document.querySelectorAll('.tabs-dropdown-control.is-open').forEach(fitDropdownMenuHeight);
  });
})();
