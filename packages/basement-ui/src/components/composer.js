/**
 * Composer — grow a chat composer's textarea with its text where CSS
 * `field-sizing: content` is not supported. The max height stays in CSS.
 */
(function () {
  if (window.CSS && CSS.supports && CSS.supports('field-sizing', 'content')) return;

  function fit(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + (el.offsetHeight - el.clientHeight) + 'px';
  }

  document.addEventListener('input', function (event) {
    var el = event.target;
    if (el && el.matches && el.matches('.chat-composer textarea')) fit(el);
  });

  window.BasementComposer = { fit: fit };
})();
