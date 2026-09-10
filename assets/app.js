(function () {
  'use strict';

  var DATA = window.FOOD_TRUCKS;
  var LOCATIONS = DATA.locations;
  var SCHEDULE = DATA.schedule;

  var DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  var MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }

  // Monday of the week containing `d`.
  function startOfWeek(d) {
    var offset = (d.getDay() + 6) % 7;
    return addDays(d, -offset);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function externalLink(href, className, text) {
    var a = el('a', className, text);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }

  function menuSearchUrl(truckName) {
    return 'https://www.google.com/search?q=' + encodeURIComponent(truckName + ' Seattle menu');
  }

  function buildDayCell(date, todayIso) {
    var key = iso(date);
    var events = SCHEDULE[key] || [];

    var cell = el('div', 'cell');
    cell.setAttribute('data-date', key);

    var dnum = el('span', 'dnum', MONTH_SHORT[date.getMonth()] + ' ' + date.getDate() + ' ');
    dnum.appendChild(el('span', 'dname', DAY_SHORT[date.getDay()]));
    cell.appendChild(dnum);

    events.forEach(function (entry) {
      var locKey = entry[0], emoji = entry[1], truck = entry[2], hours = entry[3];
      var loc = LOCATIONS[locKey];
      if (!loc) return;

      var ev = el('div', 'ev');
      ev.setAttribute('data-loc', locKey);
      ev.appendChild(externalLink(loc.url, 'loc l-' + locKey, loc.tag));
      ev.appendChild(document.createTextNode(' '));
      ev.appendChild(externalLink(menuSearchUrl(truck), 'evn', emoji + ' ' + truck));
      ev.appendChild(el('span', 'evh', hours));
      cell.appendChild(ev);
    });

    cell.appendChild(el('span', 'none-msg', 'no listing'));
    if (!events.length) cell.classList.add('empty');

    if (key === todayIso) {
      cell.classList.add('today');
      dnum.appendChild(document.createTextNode(' · '));
      dnum.appendChild(el('span', 'todaytag', 'Today'));
    }
    return cell;
  }

  // `days` is a flat list of Date objects and nulls (nulls render as blank filler cells).
  function buildCalendar(headerLabels, days, todayIso) {
    var scroll = el('div', 'cal-scroll');

    var head = el('div', 'cal-head');
    headerLabels.forEach(function (label) { head.appendChild(el('div', null, label)); });
    scroll.appendChild(head);

    for (var i = 0; i < days.length; i += 7) {
      var week = el('div', 'cal-week');
      days.slice(i, i + 7).forEach(function (date) {
        week.appendChild(date ? buildDayCell(date, todayIso) : el('div', 'blankcell'));
      });
      scroll.appendChild(week);
    }
    return scroll;
  }

  function weekDays(monday) {
    var days = [];
    for (var i = 0; i < 7; i++) days.push(addDays(monday, i));
    return days;
  }

  // Sunday-first month grid, padded with nulls so weeks line up.
  function monthDays(year, month) {
    var first = new Date(year, month, 1);
    var days = [];
    for (var i = 0; i < first.getDay(); i++) days.push(null);
    var d = new Date(first);
    while (d.getMonth() === month) {
      days.push(new Date(d));
      d = addDays(d, 1);
    }
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  function buildFilters(panelId) {
    var bar = el('div', 'filters');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Filter by location');

    var chips = [{ key: 'all', label: 'All locations' }];
    Object.keys(LOCATIONS).forEach(function (key) {
      chips.push({ key: key, label: LOCATIONS[key].name });
    });

    var buttons = chips.map(function (chip) {
      var b = el('button', 'fchip', chip.label);
      b.setAttribute('data-loc', chip.key);
      b.setAttribute('aria-pressed', chip.key === 'all' ? 'true' : 'false');
      b.addEventListener('click', function () {
        buttons.forEach(function (other) {
          other.setAttribute('aria-pressed', other === b ? 'true' : 'false');
        });
        applyFilter(panelId, chip.key);
      });
      bar.appendChild(b);
      return b;
    });
    return bar;
  }

  function applyFilter(panelId, locKey) {
    var cells = document.querySelectorAll('#' + panelId + ' .cell');
    Array.prototype.forEach.call(cells, function (cell) {
      var matched = false;
      Array.prototype.forEach.call(cell.querySelectorAll('.ev'), function (ev) {
        var show = locKey === 'all' || ev.getAttribute('data-loc') === locKey;
        ev.style.display = show ? '' : 'none';
        if (show) matched = true;
      });
      cell.classList.toggle('empty', !matched);
    });
  }

  function renderPanel(panelId, heading, sub, headerLabels, days, todayIso) {
    var panel = document.getElementById(panelId);
    panel.querySelector('.sec').textContent = heading;
    panel.querySelector('.sub').textContent = sub;
    panel.appendChild(buildFilters(panelId));
    panel.appendChild(buildCalendar(headerLabels, days, todayIso));
  }

  function renderLinks() {
    var bar = document.querySelector('.links');
    Object.keys(LOCATIONS).forEach(function (key) {
      bar.appendChild(externalLink(LOCATIONS[key].url, 'btn solid', LOCATIONS[key].name));
    });
    bar.appendChild(externalLink('https://www.ballardfoodtrucks.com/', 'btn', 'All-Ballard tracker (fallback)'));
  }

  function wireTabs() {
    var tabs = document.querySelectorAll('.tab');
    var panels = document.querySelectorAll('.panel');
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.addEventListener('click', function () {
        var id = tab.getAttribute('data-panel');
        Array.prototype.forEach.call(panels, function (p) { p.classList.toggle('active', p.id === id); });
        Array.prototype.forEach.call(tabs, function (t) {
          t.setAttribute('aria-selected', t.getAttribute('data-panel') === id ? 'true' : 'false');
        });
        if (window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function init() {
    var today = new Date();
    var todayIso = iso(today);
    var monday = startOfWeek(today);
    var sunday = addDays(monday, 6);

    var range = MONTH_SHORT[monday.getMonth()] + ' ' + monday.getDate() + ' – ' +
      (monday.getMonth() === sunday.getMonth() ? '' : MONTH_SHORT[sunday.getMonth()] + ' ') + sunday.getDate();
    document.querySelector('.wk-range').textContent = range;

    var thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    var nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    renderPanel('week', 'This Week',
      DAY_LONG[monday.getDay()] + ', ' + MONTH_LONG[monday.getMonth()] + ' ' + monday.getDate() +
      ' → ' + DAY_LONG[sunday.getDay()] + ', ' + MONTH_LONG[sunday.getMonth()] + ' ' + sunday.getDate() +
      '. Tap a brewery tag for its schedule, or a truck name for its menu.',
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], weekDays(monday), todayIso);

    renderPanel('month', 'This Month — ' + MONTH_LONG[thisMonth.getMonth()],
      'The whole month, so you can look back at earlier days too. How far back depends on how much each taproom still publishes — some only cover recent weeks.',
      DAY_SHORT, monthDays(thisMonth.getFullYear(), thisMonth.getMonth()), todayIso);

    renderPanel('nextmonth', 'Next Month — ' + MONTH_LONG[nextMonth.getMonth()],
      'Next month so far. Most taprooms only publish a week or two out, so next month fills in as they post — Lucky Envelope’s Friday/Saturday trucks are usually the first to appear.',
      DAY_SHORT, monthDays(nextMonth.getFullYear(), nextMonth.getMonth()), todayIso);

    renderLinks();
    wireTabs();
  }

  init();
})();
