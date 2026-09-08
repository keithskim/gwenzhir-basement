/**
 * Scroll-aware edge fades — mask clipped edges instead of hard-cutting.
 */
(function () {
  function update(el, axis) {
    if (!el) return;
    if (axis === 'y') {
      var maxY = el.scrollHeight - el.clientHeight;
      el.classList.toggle('vfade-t', el.scrollTop > 1);
      el.classList.toggle('vfade-b', el.scrollTop < maxY - 1);
    } else {
      var maxX = el.scrollWidth - el.clientWidth;
      el.classList.toggle('fade-l', el.scrollLeft > 1);
      el.classList.toggle('fade-r', el.scrollLeft < maxX - 1);
    }
  }

  function wire(el, axis) {
    if (!el) return;
    /* Tabs overflow is stack/dropdown — never horizontal scroll masks */
    if (el.classList && el.classList.contains('tabs')) return;
    axis = axis === 'y' ? 'y' : 'x';
    el.classList.add(axis === 'y' ? 'vedge-fade' : 'edge-fade');
    if (!el.__edgeFade) {
      el.__edgeFade = true;
      el.addEventListener(
        'scroll',
        function () {
          update(el, axis);
        },
        { passive: true },
      );
      if (window.ResizeObserver) {
        new ResizeObserver(function () {
          update(el, axis);
        }).observe(el);
      }
    }
    update(el, axis);
  }

  function wireHeader(scroller, target) {
    if (!scroller || scroller.__headerFade) return;
    scroller.__headerFade = true;
    target = target || scroller;
    var sync = function () {
      target.classList.toggle('scrolled', scroller.scrollTop > 0);
    };
    scroller.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  window.BasementEdgeFade = {
    wire: wire,
    update: update,
    wireHeader: wireHeader,
  };
})();
