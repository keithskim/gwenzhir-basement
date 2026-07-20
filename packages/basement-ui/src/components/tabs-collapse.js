/**
 * Collapse `.tabs` into a vertical list when labels exceed the available width.
 * Skips `.tabs--full`. Opt out with `data-tabs-collapse="off"`.
 */
(function () {
  function syncTabsCollapse(tabsEl) {
    if (
      !tabsEl ||
      tabsEl.classList.contains('tabs--full') ||
      tabsEl.dataset.tabsCollapse === 'off'
    ) {
      return;
    }

    tabsEl.classList.remove('tabs--stacked');
    const overflowing = tabsEl.scrollWidth > tabsEl.clientWidth + 1;
    tabsEl.classList.toggle('tabs--stacked', overflowing);
  }

  function watchTabsCollapse(tabsEl) {
    const sync = () => syncTabsCollapse(tabsEl);
    sync();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(sync);
      observer.observe(tabsEl);
      if (tabsEl.parentElement) observer.observe(tabsEl.parentElement);
    }

    window.addEventListener('resize', sync);
  }

  function initTabsCollapse(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.tabs').forEach(watchTabsCollapse);
  }

  window.BasementTabs = {
    sync: syncTabsCollapse,
    watch: watchTabsCollapse,
    init: initTabsCollapse,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initTabsCollapse(document));
  } else {
    initTabsCollapse(document);
  }
})();
