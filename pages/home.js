/* Journey — Home Page */

safeRender(function() {
  var trips = loadTrips();
  var upcoming = trips.filter(function(t) { return t.status === 'planning'; });
  var active = trips.filter(function(t) { return t.status === 'traveling'; });
  var completed = trips.filter(function(t) { return t.status === 'completed'; });
  var next = upcoming[0];

  // Countdown
  var cd = document.querySelector('.countdown-card');
  if (cd && next) {
    var today = new Date().toISOString().split('T')[0];
    var daysLeft = Math.max(0, daysBetween(today, next.startDate));
    var numEl = cd.querySelector('.number');
    var destEl = document.getElementById('countdownDest');
    var emojiEl = document.getElementById('countdownEmoji');
    var nameEl = document.getElementById('countdownTripName');
    var subEl = document.getElementById('countdownTripSub');
    var progBar = cd.querySelector('.animate-progress');
    var progWrap = document.getElementById('countdownProgress');
    var pctEl = document.getElementById('countdownPct');

    if (numEl) numEl.textContent = daysLeft;
    if (destEl) destEl.textContent = '距离' + (next.destination || '') + '之旅';
    if (emojiEl) emojiEl.textContent = next.emoji || '🌏';
    if (nameEl) nameEl.textContent = next.name || (next.destination + '之旅');
    if (subEl) {
      var dayCount = next.days instanceof Array ? next.days.length : (next.days || 0);
      subEl.textContent = (next.startDate || '') + ' - ' + (next.endDate || '') + ' · ' + dayCount + '天 · 👥 ' + (next.members || 1) + '人';
    }
    if (progWrap) progWrap.style.display = 'flex';
    if (progBar) progBar.style.width = (next.readiness || 30) + '%';
    if (pctEl) pctEl.textContent = (next.readiness || 30) + '%';

    cd.onclick = function() { location.href = 'trip-detail.html?id=' + next.id; };
    cd.style.cursor = 'pointer';
  } else if (cd && !next) {
    // No upcoming trips — make countdown clickable to create one
    cd.onclick = function() { location.href = 'create.html'; };
    cd.style.cursor = 'pointer';
  }

  // Stats with extra info
  var totalPlaces = trips.reduce(function(s, t) {
    return s + (t.days instanceof Array ? t.days.reduce(function(ds, d) { return ds + (d.places ? d.places.length : 0); }, 0) : 0);
  }, 0);
  var totalExpenses = trips.reduce(function(s, t) {
    return s + (t.expenses || []).reduce(function(es, e) { return es + e.amount; }, 0);
  }, 0);
  var statsVals = document.querySelectorAll('.stats-grid .value');
  if (statsVals.length >= 4) {
    statsVals[0].textContent = trips.length;
    statsVals[1].textContent = active.length;
    statsVals[2].textContent = completed.length;
    statsVals[3].textContent = upcoming.length;
  }
  // Update stat labels to show extra info
  var statsLabels = document.querySelectorAll('.stats-grid .label');
  if (statsLabels.length >= 4) {
    if (totalExpenses > 0) statsLabels[0].textContent = '次旅行 · ¥' + totalExpenses.toLocaleString();
    if (totalPlaces > 0) statsLabels[2].textContent = '已完成 · ' + totalPlaces + '个地点';
  }

  // Active trips — section index 3 (0:hero, 1:stats, 2:countdown, 3:进行中, 4:即将出发, 5:日志, 6:CTA)
  var sections = document.querySelectorAll('section');
  var activeSection = sections[3];
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
    var grid2 = activeSection.querySelector('.trips-grid');
    if (grid2) {
      grid2.innerHTML = '<a href="create.html" class="empty-state-action">' +
        '<i class="fas fa-plane-departure"></i>' +
        '<h4>还没有进行中的旅行</h4>' +
        '<p>创建一次新旅行，开启你的旅程</p></a>';
    }
  }

  // Upcoming — section index 4
  var upSection = sections[4];
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
  } else if (upSection && upcoming.length <= 1) {
    var upGrid2 = upSection.querySelector('.trips-grid');
    if (upGrid2) {
      if (upcoming.length === 0) {
        upGrid2.innerHTML = '<a href="create.html" class="empty-state-action">' +
          '<i class="fas fa-map"></i>' +
          '<h4>规划你的下一次旅行</h4>' +
          '<p>让 AI 帮你规划完美行程</p></a>';
      } else {
        upGrid2.innerHTML = '<a href="create.html" class="empty-state-action">' +
          '<i class="fas fa-plus-circle"></i>' +
          '<h4>再规划一次旅行</h4>' +
          '<p>探索新的目的地</p></a>';
      }
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
    journalSection.innerHTML = '<div class="empty-state" style="min-width:100%;"><i class="fas fa-book"></i><h3>暂无日志</h3><p>完成旅行后会在这里显示</p></div>';
  }
});
