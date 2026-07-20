/* Journey — Home Page */

safeRender(function() {
  var trips = loadTrips();
  var upcoming = trips.filter(function(t) { return t.status === 'planning'; });
  var active = trips.filter(function(t) { return t.status === 'traveling'; });
  var completed = trips.filter(function(t) { return t.status === 'completed'; });
  var next = upcoming[0];

  // Countdown
  if (next) {
    var cd = document.querySelector('.countdown-card');
    var today = new Date().toISOString().split('T')[0];
    var daysLeft = Math.max(0, daysBetween(today, next.startDate));
    cd.querySelector('.number').textContent = daysLeft;
    cd.querySelector('.unit').nextSibling.textContent = '距离' + (next.destination || '') + '之旅';
    var pctBar = cd.querySelector('.animate-progress');
    if (pctBar) pctBar.style.width = (next.readiness || 30) + '%';
    var pctSpan = cd.querySelector('span[style*="font-size:14px"]');
    if (pctSpan) pctSpan.textContent = (next.readiness || 30) + '%';
    cd.onclick = function() { location.href = 'trip-detail.html?id=' + next.id; };
    cd.style.cursor = 'pointer';
  }

  // Stats
  var statsVals = document.querySelectorAll('.stats-grid .value');
  if (statsVals.length >= 4) {
    statsVals[0].textContent = trips.length;
    statsVals[1].textContent = active.length;
    statsVals[2].textContent = completed.length;
    statsVals[3].textContent = upcoming.length;
  }

  // Active trips
  var sections = document.querySelectorAll('section');
  var activeSection = sections[2];
  if (active.length && activeSection) {
    var grid = activeSection.querySelector('.trips-grid');
    if (grid) {
      grid.innerHTML = active.map(function(t) {
        return '<a href="trip-detail.html?id=' + t.id + '" class="card trip-card" style="text-decoration:none;color:inherit;">' +
          '<div class="icon-box green">✈️</div>' +
          '<div class="info"><div class="name">' + t.name + '</div><div class="dates">' + t.startDate + ' - ' + t.endDate + ' · ' + (t.members || 1) + '人同行</div></div>' +
          '<span class="tag green">进行中</span></a>';
      }).join('');
    }
  } else if (activeSection) {
    activeSection.style.display = 'none';
  }

  // Upcoming
  var upSection = document.querySelector('#upcoming-section') || sections[3];
  if (upcoming.length > 1 && upSection) {
    var upGrid = upSection.querySelector('.trips-grid');
    if (upGrid) {
      upGrid.innerHTML = upcoming.filter(function(t) { return t.id !== (next || {}).id; }).map(function(t) {
        return '<a href="trip-detail.html?id=' + t.id + '" class="card trip-card" style="text-decoration:none;color:inherit;">' +
          '<div class="icon-box blue">📅</div>' +
          '<div class="info"><div class="name">' + t.name + '</div><div class="dates">' + t.startDate + ' - ' + t.endDate + ' · ' + (t.days instanceof Array ? t.days.length : t.days) + '天</div></div>' +
          '<span class="tag amber">准备中</span></a>';
      }).join('');
    }
  }

  // Journal cards
  var journalSection = document.getElementById('journalScroll');
  if (journalSection && completed.length) {
    journalSection.innerHTML = completed.map(function(t) {
      return '<a href="journal.html?trip=' + t.id + '" class="card journal-mini" style="text-decoration:none;color:inherit;">' +
        '<div style="font-size:40px;margin-bottom:12px;">📖</div>' +
        '<div style="font-weight:600;font-size:15px;">' + (t.destination || '') + '</div>' +
        '<div style="font-size:12px;color:var(--muted-fg);margin-top:4px;">' + (t.days instanceof Array ? t.days.length : t.days) + '天 · ' + (t.startDate || '').slice(0, 7) + '</div></a>';
    }).join('');
  } else if (journalSection && !completed.length) {
    journalSection.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted-fg);">完成旅行后这里会显示日志 📖</div>';
  }
});
