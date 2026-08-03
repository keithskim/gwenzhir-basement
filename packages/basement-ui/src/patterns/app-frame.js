/**
 * Multi-pane app frame — sheet layout helpers and exclusive panel drawers.
 * Left/right pane chrome (panel / drawer / resize) is owned by BasementPanel.
 */
(function () {
  function leftPanel(root) {
    return root.querySelector('.panel--left, .app-frame-side');
  }

  function rightPanel(root) {
    return root.querySelector('.panel--right');
  }

  function closePanel(panel) {
    if (!panel) return;
    if (window.BasementPanel) window.BasementPanel.close(panel);
    else panel.classList.remove('is-open');
  }

  function closeDrawers(root) {
    closePanel(leftPanel(root));
    closePanel(rightPanel(root));
  }

  function init(root) {
    if (!root || root.__basementFrame) return;
    root.__basementFrame = true;
    root.classList.add('panel-host');

    var left = leftPanel(root);
    var right = rightPanel(root);

    /* Opening one drawer closes the other */
    [left, right].forEach(function (panel) {
      if (!panel) return;
      var observer = new MutationObserver(function () {
        if (!panel.classList.contains('is-open')) return;
        [left, right].forEach(function (other) {
          if (other && other !== panel) closePanel(other);
        });
      });
      observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
    });

    var rightBody = right && right.querySelector('.panel-body');
    if (rightBody && window.BasementEdgeFade) {
      window.BasementEdgeFade.wireHeader(rightBody);
    }

    var hasRight =
      root.classList.contains('is-detail-available') ||
      (right && !right.hasAttribute('hidden'));
    root.classList.toggle('is-detail-available', !!hasRight);

    root._basementFrameApi = {
      closeDrawers: function () {
        closeDrawers(root);
      },
      closeLeft: function () {
        closePanel(left);
      },
      closeRight: function () {
        closePanel(right);
      },
    };
  }

  window.BasementFrame = {
    init: init,
    closeDrawers: function (root) {
      closeDrawers(root || document.querySelector('.app-frame'));
    },
    closeLeft: function (root) {
      closePanel(leftPanel(root || document.querySelector('.app-frame')));
    },
    closeRight: function (root) {
      closePanel(rightPanel(root || document.querySelector('.app-frame')));
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('.app-frame').forEach(init);
    });
  } else {
    document.querySelectorAll('.app-frame').forEach(init);
  }
})();
