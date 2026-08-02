const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const yearMonthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

function parseDateValue(value) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseYearMonthValue(value) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );
}

function sameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDate(date) {
  return dateFormatter.format(date);
}

function formatYearMonth(date) {
  return yearMonthFormatter.format(date);
}

function useFloat() {
  return Boolean(window.BasementFloat);
}

function getDatetimePopup(field) {
  return field._datetimePopup || field.querySelector('.datetime-popup');
}

function closeAllDatetimes(exceptField) {
  document.querySelectorAll('.datetime-field.is-open, .datetime.is-open').forEach(field => {
    if (field === exceptField) return;
    if (typeof field._closeDatetime === 'function') {
      field._closeDatetime();
      return;
    }
    field.classList.remove('is-open');
    const input = field.querySelector('.datetime-input');
    const popup = getDatetimePopup(field);
    if (input) input.setAttribute('aria-expanded', 'false');
    if (popup) {
      if (useFloat()) window.BasementFloat.close(popup);
      popup.hidden = true;
    }
  });
}

function createNavButton(direction) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--xs btn--ghost btn--icon datetime-nav';
  button.dataset.nav = direction;
  button.setAttribute(
    'aria-label',
    direction === 'prev' ? 'Previous' : 'Next',
  );
  const icon = document.createElement('i');
  icon.className = `ph ph-caret-${direction === 'prev' ? 'left' : 'right'} icon--m`;
  icon.setAttribute('aria-hidden', 'true');
  button.appendChild(icon);
  return button;
}

function renderDayPopup(field, state) {
  const popup = getDatetimePopup(field);
  const { viewDate, selectedDate } = state;
  const today = new Date();
  const monthStart = startOfMonth(viewDate);
  const startOffset = monthStart.getDay();
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - startOffset);

  popup.replaceChildren();

  const header = document.createElement('div');
  header.className = 'datetime-popup-header';
  header.append(
    createNavButton('prev'),
    Object.assign(document.createElement('div'), {
      className: 'datetime-popup-label',
      textContent: yearMonthFormatter.format(viewDate),
    }),
    createNavButton('next'),
  );
  popup.appendChild(header);

  const weekdays = document.createElement('div');
  weekdays.className = 'datetime-weekdays';
  WEEKDAYS.forEach(label => {
    const cell = document.createElement('div');
    cell.className = 'datetime-weekday';
    cell.textContent = label;
    weekdays.appendChild(cell);
  });
  popup.appendChild(weekdays);

  const days = document.createElement('div');
  days.className = 'datetime-days';
  days.setAttribute('role', 'grid');

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'datetime-day';
    button.textContent = String(date.getDate());
    button.dataset.date = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');

    if (date.getMonth() !== viewDate.getMonth()) {
      button.classList.add('datetime-day--outside');
    }
    if (sameDay(date, today)) {
      button.classList.add('is-today');
    }
    if (selectedDate && sameDay(date, selectedDate)) {
      button.classList.add('is-selected');
      button.setAttribute('aria-selected', 'true');
    }

    days.appendChild(button);
  }

  popup.appendChild(days);

  if (useFloat() && floatStateHas(popup)) {
    window.BasementFloat.place(field.querySelector('.datetime-input'), popup);
  }
}

function renderYearMonthPopup(field, state) {
  const popup = getDatetimePopup(field);
  const { viewDate, selectedDate } = state;
  popup.replaceChildren();
  popup.classList.add('datetime-popup--year-month');

  const header = document.createElement('div');
  header.className = 'datetime-popup-header';
  header.append(
    createNavButton('prev'),
    Object.assign(document.createElement('div'), {
      className: 'datetime-popup-label',
      textContent: String(viewDate.getFullYear()),
    }),
    createNavButton('next'),
  );
  popup.appendChild(header);

  const months = document.createElement('div');
  months.className = 'datetime-months';
  months.setAttribute('role', 'grid');

  MONTHS_SHORT.forEach((label, monthIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'datetime-month';
    button.textContent = label;
    button.dataset.month = String(monthIndex);

    const monthDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    if (selectedDate && sameMonth(monthDate, selectedDate)) {
      button.classList.add('is-selected');
      button.setAttribute('aria-selected', 'true');
    }

    months.appendChild(button);
  });

  popup.appendChild(months);

  if (useFloat() && floatStateHas(popup)) {
    window.BasementFloat.place(field.querySelector('.datetime-input'), popup);
  }
}

function floatStateHas(panel) {
  return Boolean(panel && panel.classList.contains('is-float-open'));
}

function setFieldValue(field, state, date) {
  state.selectedDate = date;
  const input = field.querySelector('.datetime-input');
  const valueEl = field.querySelector('.datetime-value');
  if (!input || !valueEl) return;

  if (date) {
    valueEl.textContent = state.variant === 'year-month'
      ? formatYearMonth(date)
      : formatDate(date);
    input.classList.add('has-value');
  } else {
    valueEl.textContent = '';
    input.classList.remove('has-value');
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-demo.is-open').forEach(demo => {
    demo.classList.remove('is-open');
    const trigger = demo.querySelector('.dropdown-trigger');
    const menu = demo.querySelector('.menu');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (menu) menu.hidden = true;
  });
}

function openField(field, state) {
  closeAllDatetimes(field);
  closeAllDropdowns();
  field.classList.add('is-open');
  const input = field.querySelector('.datetime-input');
  const popup = getDatetimePopup(field);
  if (input) input.setAttribute('aria-expanded', 'true');
  if (popup) popup.hidden = false;

  if (state.variant === 'year-month') {
    renderYearMonthPopup(field, state);
  } else {
    renderDayPopup(field, state);
  }

  if (useFloat() && input && popup) {
    window.BasementFloat.open({
      anchor: input,
      panel: popup,
      mode: 'dialog',
      onClose: () => {
        field.classList.remove('is-open');
        if (input) input.setAttribute('aria-expanded', 'false');
        popup.hidden = true;
      },
    });
  }
}

function closeField(field) {
  const popup = getDatetimePopup(field);
  if (useFloat() && popup) {
    window.BasementFloat.close(popup);
  }
  field.classList.remove('is-open');
  const input = field.querySelector('.datetime-input');
  if (input) input.setAttribute('aria-expanded', 'false');
  if (popup) popup.hidden = true;
}

function initDatetimeField(field, variant) {
  const input = field.querySelector('.datetime-input');
  const popup = field.querySelector('.datetime-popup');
  if (!input || !popup) return;
  field._datetimePopup = popup;

  const initialValue = field.dataset.value || '';
  const selectedDate = variant === 'year-month'
    ? parseYearMonthValue(initialValue)
    : parseDateValue(initialValue);

  const state = {
    variant,
    selectedDate,
    viewDate: selectedDate ? new Date(selectedDate) : new Date(),
  };

  if (selectedDate) {
    setFieldValue(field, state, selectedDate);
  }

  field._closeDatetime = () => closeField(field);

  input.addEventListener('click', event => {
    event.stopPropagation();
    const isOpen = field.classList.contains('is-open');
    if (isOpen) {
      closeField(field);
      return;
    }
    if (state.selectedDate) {
      state.viewDate = new Date(state.selectedDate);
    }
    openField(field, state);
  });

  popup.addEventListener('click', event => {
    event.stopPropagation();

    const navButton = event.target.closest('.datetime-nav');
    if (navButton) {
      event.stopPropagation();
      const direction = navButton.dataset.nav === 'prev' ? -1 : 1;
      if (state.variant === 'year-month') {
        state.viewDate = new Date(
          state.viewDate.getFullYear() + direction,
          state.viewDate.getMonth(),
          1,
        );
        renderYearMonthPopup(field, state);
      } else {
        state.viewDate = new Date(
          state.viewDate.getFullYear(),
          state.viewDate.getMonth() + direction,
          1,
        );
        renderDayPopup(field, state);
      }
      return;
    }

    const dayButton = event.target.closest('.datetime-day');
    if (dayButton) {
      event.stopPropagation();
      const date = parseDateValue(dayButton.dataset.date);
      if (!date) return;
      setFieldValue(field, state, date);
      closeField(field);
      field.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    const monthButton = event.target.closest('.datetime-month');
    if (monthButton) {
      event.stopPropagation();
      const monthIndex = Number(monthButton.dataset.month);
      const date = new Date(state.viewDate.getFullYear(), monthIndex, 1);
      setFieldValue(field, state, date);
      closeField(field);
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

function initDatetime(root) {
  if (root.classList.contains('datetime--duration')) {
    root.querySelectorAll('.datetime-field').forEach(field => {
      initDatetimeField(field, 'date');
    });
    return;
  }

  const variant = root.classList.contains('datetime--year-month')
    ? 'year-month'
    : 'date';
  initDatetimeField(root, variant);
}

document.querySelectorAll('.datetime').forEach(initDatetime);

document.addEventListener('click', () => {
  closeAllDatetimes();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeAllDatetimes();
  }
});

window.BasementDatetime = {
  init: initDatetime,
  closeAll: closeAllDatetimes,
};
