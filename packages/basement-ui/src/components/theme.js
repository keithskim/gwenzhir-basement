/**
 * Mirror prefers-color-scheme onto html.is-dark before first paint when possible.
 * Load in <head> (or inline a duplicate) to avoid FOUC.
 */
(function () {
  var mq = matchMedia('(prefers-color-scheme: dark)');
  var apply = function () {
    document.documentElement.classList.toggle('is-dark', mq.matches);
  };
  apply();
  mq.addEventListener('change', apply);
  window.BasementTheme = { apply: apply, media: mq };
})();
