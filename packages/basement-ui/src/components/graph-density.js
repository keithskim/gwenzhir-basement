/**
 * Dense line-graph layout — compact labels and optional horizontal scroll.
 */
(function () {
  function sync(root) {
    if (!root) return;
    var scopes =
      root.classList && root.classList.contains('graph')
        ? [root]
        : Array.from(root.querySelectorAll('.graph'));
    scopes.forEach(function (g) {
      var scroller = g.querySelector('.graph-scroller');
      var canvas = g.querySelector('.graph-canvas');
      var labels = Array.from(g.querySelectorAll('.graph-cats .graph-bar-label'));
      if (!scroller || !canvas || !labels.length) return;
      var n = labels.length;
      var w = scroller.clientWidth || 0;
      var minLabelPx = 46;
      var minPointPx = 28;
      g.classList.toggle('graph--compact-labels', n * minLabelPx > w);
      g.classList.toggle('is-compact-labels', n * minLabelPx > w);
      var needScroll = n * minPointPx > w;
      g.classList.toggle('is-scrollable', needScroll);
      canvas.style.minWidth = needScroll ? n * minPointPx + 'px' : '';
      if (window.BasementEdgeFade) {
        window.BasementEdgeFade.wire(scroller, 'x');
      }
    });
  }

  function watch(graphEl) {
    if (!graphEl) return;
    sync(graphEl);
    if (typeof ResizeObserver === 'undefined') return;
    var observer = new ResizeObserver(function () {
      sync(graphEl);
    });
    var scroller = graphEl.querySelector('.graph-scroller');
    observer.observe(scroller || graphEl);
  }

  function init(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.graph').forEach(function (g) {
      if (g.querySelector('.graph-scroller')) watch(g);
    });
  }

  window.BasementGraphDensity = {
    sync: sync,
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
    sync(document);
  });
})();
