/**
 * Month schedule calendar: navigates months and places `.calendar-event[data-date]`
 * into day cells. Init targets `.calendar[data-month]`.
 */
(function () {
  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const monthFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  });

  function parseYearMonth(value) {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})$/.exec(value);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function parseDateValue(value) {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatYearMonth(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
    ].join('-');
  }

  function formatDate(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }

  function sameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate()
    );
  }

  function createNavButton(direction) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn--xs btn--ghost btn--icon calendar-nav';
    button.dataset.nav = direction;
    button.setAttribute(
      'aria-label',
      direction === 'prev' ? 'Previous month' : 'Next month',
    );
    const icon = document.createElement('i');
    icon.className = `ph ph-caret-${direction === 'prev' ? 'left' : 'right'} icon--m`;
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);
    return button;
  }

  function collectEvents(root) {
    const eventsByDate = new Map();
    const source = root.querySelector('.calendar-events-data') || root;

    source.querySelectorAll('.calendar-event[data-date]').forEach(eventEl => {
      const dateKey = eventEl.dataset.date;
      if (!dateKey) return;
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey).push(eventEl.cloneNode(true));
    });

    return eventsByDate;
  }

  function ensureStructure(root) {
    let header = root.querySelector('.calendar-header');
    if (!header) {
      header = document.createElement('div');
      header.className = 'calendar-header';
      root.prepend(header);
    }

    if (!header.querySelector('.calendar-nav[data-nav="prev"]')) {
      header.replaceChildren(
        createNavButton('prev'),
        Object.assign(document.createElement('div'), {
          className: 'calendar-label',
        }),
        createNavButton('next'),
      );
    }

    let label = header.querySelector('.calendar-label');
    if (!label) {
      label = document.createElement('div');
      label.className = 'calendar-label';
      header.insertBefore(label, header.querySelector('.calendar-nav[data-nav="next"]'));
    }

    let weekdays = root.querySelector('.calendar-weekdays');
    if (!weekdays) {
      weekdays = document.createElement('div');
      weekdays.className = 'calendar-weekdays';
      header.insertAdjacentElement('afterend', weekdays);
    }

    if (!weekdays.children.length) {
      WEEKDAYS.forEach(name => {
        const cell = document.createElement('div');
        cell.className = 'calendar-weekday';
        cell.textContent = name;
        weekdays.appendChild(cell);
      });
    }

    let grid = root.querySelector('.calendar-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'calendar-grid';
      grid.setAttribute('role', 'grid');
      weekdays.insertAdjacentElement('afterend', grid);
    }

    let data = root.querySelector('.calendar-events-data');
    if (!data) {
      data = document.createElement('ul');
      data.className = 'calendar-events-data';
      root.appendChild(data);
    }

    return { header, label, weekdays, grid, data };
  }

  function renderCalendar(root, state) {
    const { label, grid } = ensureStructure(root);
    const { viewDate, today, selectedDate, eventsByDate } = state;

    root.dataset.month = formatYearMonth(viewDate);
    label.textContent = monthFormatter.format(viewDate);

    const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const startOffset = monthStart.getDay();
    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - startOffset);

    grid.replaceChildren();

    for (let index = 0; index < 42; index += 1) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const dateKey = formatDate(date);

      const day = document.createElement('div');
      day.className = 'calendar-day';
      day.setAttribute('role', 'gridcell');
      day.dataset.date = dateKey;

      if (date.getMonth() !== viewDate.getMonth()) {
        day.classList.add('calendar-day--outside');
      }
      if (today && sameDay(date, today)) {
        day.classList.add('is-today');
      }
      if (selectedDate && sameDay(date, selectedDate)) {
        day.classList.add('is-selected');
      }

      const number = document.createElement('span');
      number.className = 'calendar-day-number';
      number.textContent = String(date.getDate());
      day.appendChild(number);

      const dayEvents = eventsByDate.get(dateKey);
      if (dayEvents && dayEvents.length) {
        const list = document.createElement('ul');
        list.className = 'calendar-events';
        dayEvents.forEach(eventEl => {
          list.appendChild(eventEl.cloneNode(true));
        });
        day.appendChild(list);
      }

      grid.appendChild(day);
    }
  }

  function moveEventsToDataStore(root, data) {
    root.querySelectorAll('.calendar-grid .calendar-event[data-date]').forEach(eventEl => {
      data.appendChild(eventEl);
    });
  }

  function initCalendar(root) {
    const structure = ensureStructure(root);
    moveEventsToDataStore(root, structure.data);

    const initialMonth = parseYearMonth(root.dataset.month) || new Date();
    const today = parseDateValue(root.dataset.today) || new Date();
    const selectedDate = parseDateValue(root.dataset.selected);

    const state = {
      viewDate: new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
      today,
      selectedDate,
      eventsByDate: collectEvents(root),
    };

    renderCalendar(root, state);

    root.addEventListener('click', event => {
      const navButton = event.target.closest('.calendar-nav');
      if (!navButton || !root.contains(navButton)) return;

      const direction = navButton.dataset.nav === 'prev' ? -1 : 1;
      state.viewDate = new Date(
        state.viewDate.getFullYear(),
        state.viewDate.getMonth() + direction,
        1,
      );
      renderCalendar(root, state);
    });
  }

  document.querySelectorAll('.calendar[data-month]').forEach(initCalendar);
}());
