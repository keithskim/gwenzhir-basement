/**
 * Wire `.tooltip` triggers through BasementFloat (hover / keyboard focus / Escape).
 * Pointer click focus does not keep the tip open — only :hover and :focus-visible do.
 * Marks wired roots with data-basement-float="tooltip" so CSS hover does not double-show.
 */
(function () {
  function wireTooltip(el) {
    if (el.dataset.basementFloat) return;
    var trigger = el.querySelector('.tooltip-trigger');
    var content = el.querySelector('.tooltip-content');
    if (!trigger || !content) return;
    if (!window.BasementFloat) return;

    el.dataset.basementFloat = 'tooltip';
    var open = false;
    var hideTimer = 0;

    var show = function () {
      clearTimeout(hideTimer);
      if (open) return;
      open = true;
      window.BasementFloat.open({
        anchor: trigger,
        panel: content,
        mode: 'tooltip',
        onClose: function () {
          open = false;
        },
      });
    };

    var hide = function () {
      clearTimeout(hideTimer);
      if (!open) return;
      open = false;
      window.BasementFloat.close(content);
    };

    var shouldStayOpen = function () {
      return (
        trigger.matches(':hover') ||
        content.matches(':hover') ||
        trigger.matches(':focus-visible') ||
        (content.contains(document.activeElement) &&
          document.activeElement &&
          document.activeElement.matches(':focus-visible'))
      );
    };

    var scheduleHide = function () {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        if (shouldStayOpen()) return;
        hide();
      }, 80);
    };

    trigger.addEventListener('mouseenter', show);
    trigger.addEventListener('focus', function () {
      // Defer so :focus-visible is resolved (skip click-induced focus).
      requestAnimationFrame(function () {
        if (trigger.matches(':focus-visible')) show();
      });
    });
    trigger.addEventListener('click', function () {
      // Selected / pressed toggles keep focus; dismiss tip for pointer users.
      requestAnimationFrame(function () {
        if (!trigger.matches(':focus-visible')) hide();
      });
    });
    content.addEventListener('mouseenter', function () {
      clearTimeout(hideTimer);
    });
    trigger.addEventListener('mouseleave', scheduleHide);
    content.addEventListener('mouseleave', scheduleHide);
    trigger.addEventListener('blur', scheduleHide);
  }

  function init(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.tooltip').forEach(wireTooltip);
  }

  window.BasementTooltip = { init: init, wire: wireTooltip };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init(document);
    });
  } else {
    init(document);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape' || !window.BasementFloat) return;
    document.querySelectorAll('.tooltip-content.is-float-open').forEach(function (panel) {
      window.BasementFloat.close(panel);
    });
  });
})();
