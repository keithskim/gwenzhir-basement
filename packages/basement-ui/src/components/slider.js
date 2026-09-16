/**
 * Slider — single or dual-thumb range.
 *
 * Markup:
 *   <div class="slider">
 *     <div class="slider-track" aria-hidden="true"><div class="slider-fill"></div></div>
 *     <input class="slider-input" type="range">
 *   </div>
 *
 * Range: add `.slider--range` and a second `.slider-input` (min then max).
 * Stepped: `.slider--stepped` (ticks from min / max / step). `.slider--labels` for a value under each stop.
 * Optional `.slider-value` shows the live number at the end.
 * Pair with `input[type=number]` inside `.filter-range` to keep fields in sync.
 * Opt out with `data-slider="off"`.
 */
(function () {
  function inputsOf(root) {
    return Array.prototype.slice.call(root.querySelectorAll('.slider-input'));
  }

  function numbersOf(root) {
    var scope = root.closest('.filter-range') || root;
    return Array.prototype.slice.call(scope.querySelectorAll('input[type="number"]'));
  }

  function ruleOf(root) {
    var rule = root.closest('.filter-rule');
    if (rule) return rule;
    if (root._filterRule) return root._filterRule;
    var menu = root.closest('.menu');
    var triggerId = menu && menu.getAttribute('aria-labelledby');
    var trigger = triggerId && document.getElementById(triggerId);
    return trigger ? trigger.closest('.filter-rule') : null;
  }

  function pct(input) {
    var min = Number(input.min);
    var max = Number(input.max);
    var val = Number(input.value);
    if (!isFinite(min) || !isFinite(max) || max === min) return 0;
    return ((val - min) / (max - min)) * 100;
  }

  function formatValue(n) {
    if (!isFinite(n)) return '';
    if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
    return String(n);
  }

  function paint(root) {
    var inputs = inputsOf(root);
    if (!inputs.length) return;
    if (inputs.length === 1) {
      root.style.setProperty('--slider-min', '0%');
      root.style.setProperty('--slider-max', pct(inputs[0]) + '%');
      return;
    }
    var a = Number(inputs[0].value);
    var b = Number(inputs[1].value);
    var lo = inputs[a <= b ? 0 : 1];
    var hi = inputs[a <= b ? 1 : 0];
    root.style.setProperty('--slider-min', pct(lo) + '%');
    root.style.setProperty('--slider-max', pct(hi) + '%');
  }

  function paintTicks(root) {
    if (!root.classList.contains('slider--stepped')) return;
    var input = inputsOf(root)[0];
    if (!input) return;
    var min = Number(input.min);
    var max = Number(input.max);
    var step = Number(input.step);
    if (!isFinite(min) || !isFinite(max) || max <= min) return;
    if (!isFinite(step) || step <= 0) step = 1;
    var count = Math.round((max - min) / step);
    if (count < 1) return;
    if (count > 20) count = 20;
    var labeled = root.classList.contains('slider--labels');
    var host = root.querySelector(':scope > .slider-ticks');
    if (!host) {
      host = document.createElement('div');
      host.className = 'slider-ticks';
      host.setAttribute('aria-hidden', 'true');
      root.appendChild(host);
    }
    var html = '';
    var i;
    for (i = 0; i <= count; i += 1) {
      var value = min + (i * (max - min)) / count;
      var left = (i / count) * 100;
      html += '<span class="slider-tick" style="left: ' + left + '%">';
      if (labeled) {
        html += '<span class="slider-tick-label">' + formatValue(value) + '</span>';
      }
      html += '</span>';
    }
    host.innerHTML = html;
  }

  function syncValue(root) {
    var el = root.querySelector(':scope > .slider-value');
    if (!el) return;
    var inputs = inputsOf(root);
    if (inputs.length >= 2) {
      el.textContent = formatValue(Number(inputs[0].value)) + '–' + formatValue(Number(inputs[1].value));
    } else if (inputs.length === 1) {
      el.textContent = formatValue(Number(inputs[0].value));
    }
  }

  function clamp(root, changed) {
    var inputs = inputsOf(root);
    if (inputs.length < 2) return;
    var minI = inputs[0];
    var maxI = inputs[1];
    if (Number(minI.value) <= Number(maxI.value)) return;
    if (changed === minI) minI.value = maxI.value;
    else maxI.value = minI.value;
  }

  function syncNumbers(root) {
    var inputs = inputsOf(root);
    var numbers = numbersOf(root);
    var n = Math.min(inputs.length, numbers.length);
    var i;
    for (i = 0; i < n; i += 1) {
      if (document.activeElement === numbers[i]) continue;
      numbers[i].value = inputs[i].value;
    }
  }

  function syncChip(root) {
    var rule = ruleOf(root);
    if (!rule) return;
    var valueEl = rule.querySelector('.filter-rule-value');
    if (!valueEl) return;
    var inputs = inputsOf(root);
    if (inputs.length >= 2) {
      valueEl.textContent = inputs[0].value + '–' + inputs[1].value;
    } else if (inputs.length === 1) {
      valueEl.textContent = inputs[0].value;
    }
  }

  function apply(root, changed) {
    clamp(root, changed);
    paint(root);
    syncNumbers(root);
    syncChip(root);
    syncValue(root);
  }

  function snap(input, raw) {
    var min = Number(input.min);
    var max = Number(input.max);
    var step = Number(input.step);
    if (!isFinite(step) || step <= 0) step = 1;
    var value = Math.round((raw - min) / step) * step + min;
    if (value < min) value = min;
    if (value > max) value = max;
    return value;
  }

  function valueFromPointer(root, clientX) {
    var input = inputsOf(root)[0];
    if (!input) return 0;
    var min = Number(input.min);
    var max = Number(input.max);
    var rect = input.getBoundingClientRect();
    var width = rect.width || 1;
    var ratio = (clientX - rect.left) / width;
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;
    return snap(input, min + ratio * (max - min));
  }

  function nearest(root, val) {
    var inputs = inputsOf(root);
    if (inputs.length === 1) return inputs[0];
    var d0 = Math.abs(Number(inputs[0].value) - val);
    var d1 = Math.abs(Number(inputs[1].value) - val);
    return d0 <= d1 ? inputs[0] : inputs[1];
  }

  function wire(root) {
    if (!root || root.dataset.basementSlider) return;
    if (root.getAttribute('data-slider') === 'off') return;
    var inputs = inputsOf(root);
    if (!inputs.length) return;
    root.dataset.basementSlider = '1';
    root._filterRule = root.closest('.filter-rule') || null;
    paint(root);
    paintTicks(root);
    syncValue(root);

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        apply(root, input);
      });
    });

    numbersOf(root).forEach(function (field, index) {
      field.addEventListener('input', function () {
        var pair = inputs[index];
        if (!pair) return;
        pair.value = field.value;
        apply(root, pair);
      });
    });

    root.addEventListener('pointerdown', function (event) {
      if (event.button != null && event.button !== 0) return;
      if (inputs.some(function (input) { return input.disabled; })) return;
      if (event.target.classList.contains('slider-input')) return;
      event.preventDefault();
      var val = valueFromPointer(root, event.clientX);
      var input = nearest(root, val);
      input.value = val;
      input.focus();
      apply(root, input);

      function move(ev) {
        input.value = valueFromPointer(root, ev.clientX);
        apply(root, input);
      }
      function up() {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
  }

  function init(root) {
    var scope = root && root.querySelectorAll ? root : document;
    if (root && root.classList && root.classList.contains('slider')) wire(root);
    scope.querySelectorAll('.slider').forEach(wire);
  }

  window.BasementSlider = {
    init: init,
    wire: wire,
    paint: paint,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init(document);
    });
  } else {
    init(document);
  }
})();
