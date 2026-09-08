/**
 * Thin timeline axis labels by skipping ticks and spanning columns.
 * Never ellipsize — skip + span instead.
 */
(function () {
  function syncAxis(root) {
    if (!root) return;
    var scopes =
      root.classList && root.classList.contains('timeline')
        ? [root]
        : Array.from(root.querySelectorAll('.timeline'));
    scopes.forEach(function (tl) {
      var axis = tl.querySelector(':scope > .timeline-axis');
      if (!axis) return;
      var ticks = Array.from(axis.querySelectorAll(':scope > .timeline-axis-tick'));
      var w = axis.clientWidth;
      if (!ticks.length || !w) return;
      var n = ticks.length;
      ticks.forEach(function (t) {
        t.classList.remove('is-skipped');
        t.style.gridColumn = '';
      });
      var range = document.createRange();
      var need = 0;
      ticks.forEach(function (t) {
        range.selectNodeContents(t);
        need = Math.max(need, range.getBoundingClientRect().width);
      });
      need += 6;
      var step = Math.min(n, Math.max(1, Math.ceil((n * need) / w)));
      ticks.forEach(function (t, i) {
        var keep = i % step === 0 && i + step <= n;
        t.classList.toggle('is-skipped', !keep);
        if (keep) t.style.gridColumn = i + 1 + ' / span ' + step;
      });
    });
  }

  function watch(timelineEl) {
    if (!timelineEl) return;
    syncAxis(timelineEl);
    if (typeof ResizeObserver === 'undefined') return;
    var observer = new ResizeObserver(function () {
      syncAxis(timelineEl);
    });
    var axis = timelineEl.querySelector(':scope > .timeline-axis');
    observer.observe(axis || timelineEl);
  }

  function init(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.timeline').forEach(watch);
  }

  window.BasementTimeline = {
    syncAxis: syncAxis,
    watch: watch,
    init: init,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init(document);
    });
  } else {
    init(document);
  }

  window.addEventListener('resize', function () {
    syncAxis(document);
  });
})();
