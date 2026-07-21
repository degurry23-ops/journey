/* Journey — Trip List Page (V2 — Action Console) */

safeRender(function() {
  var trips = loadTrips();
  var today = new Date().toISOString().split('T')[0];

  var counts = {
    all: trips.length,
    planning: trips.filter(function(t) { return t.status === 'planning'; }).length,
    traveling: trips.filter(function(t) { return t.status === 'traveling'; }).length,
    completed: trips.filter(function(t) { return t.status === 'completed'; }).length
  };

  // Tab names consistent: 计划中 / 进行中 / 已完成
  var tabKeys = ['all', 'planning', 'traveling', 'completed'];
  var tabLabels = ['全部', '计划中', '进行中', '已完成'];

  // Destination theming
  var destThemes = {
    '日本东京': { color: '#DC2626', bg: 'linear-gradient(135deg,#FEF2F2,#FEE2E2)', emoji: '🇯🇵' },
    '四川成都': { color: '#EA580C', bg: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)', emoji: '🐼' },
    '上海':     { color: '#2563EB', bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', emoji: '🌆' },
    '云南大理': { color: '#16A34A', bg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', emoji: '🏔️' },
    '北京':     { color: '#9333EA', bg: 'linear-gradient(135deg,#FAF5FF,#EDE9FE)', emoji: '🏯' },
    '重庆':     { color: '#DC2626', bg: 'linear-gradient(135deg,#FFF5F5,#FEE2E2)', emoji: '🌶' },
    '韩国首尔': { color: '#DB2777', bg: 'linear-gradient(135deg,#FDF2F8,#FCE7F3)', emoji: '🇰🇷' },
    '泰国曼谷': { color: '#0891B2', bg: 'linear-gradient(135deg,#ECFEFF,#CFFAFE)', emoji: '🇹🇭' }
  };

  function getTheme(dest) {
    for (var k in destThemes) { if (dest && dest.indexOf(k.replace(/^(日本|韩国|泰国|四川|云南)/,'')) >= 0) return destThemes[k]; }
    return { color: 'var(--accent)', bg: 'linear-gradient(135deg,var(--muted),var(--border))', emoji: '🌏' };
  }

  // Update tabs
  document.querySelectorAll('.tab').forEach(function(t, i) {
    t.textContent = tabLabels[i] + ' (' + counts[tabKeys[i]] + ')';
  });

  // ── Render ──
  function render(list, status) {
    var c = document.getElementById('tripList');
    var emptyMsg = document.getElementById('emptyFilterMsg');
    if (emptyMsg) emptyMsg.style.display = 'none';

    if (!trips.length) {
      // Absolute empty: new user
      c.innerHTML =
        '<div class="empty-state" style="grid-column:1/-1;">' +
          '<span style="font-size:56px;display:block;margin-bottom:16px;">🌅</span>' +
          '<h3>你的旅程尚未开始</h3>' +
          '<p style="margin-bottom:20px;">让 AI 帮你规划第一次旅行</p>' +
          '<a href="create.html" class="btn btn-primary btn-lg">✨ 开始AI规划</a>' +
        '</div>';
      return;
    }

    if (!list.length) {
      // Filter empty
      c.innerHTML = '';
      if (emptyMsg) {
        emptyMsg.style.display = 'block';
        emptyMsg.innerHTML = '<p>' + tabLabels[tabKeys.indexOf(status)] + '的旅程为空</p><button class="btn btn-outline btn-sm" onclick="filterTrips(\'all\', document.querySelector(\'.tab\'))" style="margin-top:8px;">查看全部旅程</button>';
      }
      return;
    }

    c.innerHTML = list.map(function(t) {
      var theme = getTheme(t.destination);
      var dayCount = t.days instanceof Array ? t.days.length : (t.days || 0);
      var placeCount = t.days instanceof Array ? t.days.reduce(function(s, d) { return s + (d.places ? d.places.length : 0); }, 0) : 0;
      var totalExp = (t.expenses || []).reduce(function(s, e) { return s + e.amount; }, 0);
      var photos = loadPhotos(t.id) || [];
      var placeNames = t.days instanceof Array ? t.days.slice(0, 3).reduce(function(arr, d) { return arr.concat((d.places||[]).map(function(p){return p.name;})); }, []) : [];
      var extraPlaces = Math.max(0, placeCount - 3);

      // Status-specific bottom section
      var actionHTML = '';
      if (t.status === 'traveling') {
        var daysGone = daysBetween(t.startDate, today);
        var currentDay = Math.min(dayCount, Math.max(1, daysGone + 1));
        actionHTML = '<div class="card-action"><div class="card-action-row">' +
          '<span>📍 Day ' + currentDay + '/' + dayCount + '</span>' +
          (totalExp > 0 ? '<span>💰 ¥' + totalExp.toLocaleString() + '</span>' : '') +
          '<span style="margin-left:auto;color:var(--accent);font-weight:600;">今日旅程 →</span>' +
        '</div></div>';
      } else if (t.status === 'planning') {
        actionHTML = '<div class="card-action"><div class="card-action-row">' +
          '<span>📋 准备度 ' + (t.readiness || 30) + '%</span>' +
          '<span style="margin-left:auto;color:var(--accent);font-weight:600;">完善行程 →</span>' +
        '</div></div>';
      } else {
        actionHTML = '<div class="card-action"><div class="card-action-row">' +
          (photos.length ? '<span>📷 ' + photos.length + '张照片</span>' : '') +
          (totalExp > 0 ? '<span>💰 ¥' + totalExp.toLocaleString() + '</span>' : '') +
          (t.summary ? '<span style="font-size:12px;opacity:.7;">' + t.summary.slice(0, 30) + '...</span>' : '') +
          '<span style="margin-left:auto;color:var(--accent);font-weight:600;">查看回忆 →</span>' +
        '</div></div>';
      }

      return '<a href="trip-detail.html?id=' + t.id + '" class="journey-card" style="border-left:4px solid ' + theme.color + ';">' +
        // Header
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
          '<span style="font-size:32px;">' + (t.emoji || theme.emoji || '🌏') + '</span>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-weight:700;font-size:16px;">' + t.name + '</div>' +
            '<div style="font-size:13px;color:var(--muted-fg);">' + t.startDate + ' - ' + t.endDate + ' · ' + dayCount + '天 · ' + (t.members||1) + '人</div>' +
          '</div>' +
          '<span class="tag tag-sm ' + (t.status==='planning'?'tag-amber':t.status==='traveling'?'tag-green':'tag-gray') + '">' + (t.status==='planning'?'计划中':t.status==='traveling'?'进行中':'已完成') + '</span>' +
        '</div>' +
        // Place preview
        (placeNames.length ? '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">' +
          placeNames.slice(0,3).map(function(n) { return '<span class="place-chip">' + n + '</span>'; }).join('') +
          (extraPlaces > 0 ? '<span class="place-chip" style="background:var(--muted);">+' + extraPlaces + '</span>' : '') +
        '</div>' : '') +
        // Action bar
        actionHTML +
      '</a>';
    }).join('');
  }

  window.filterTrips = function(status, el) {
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    el.classList.add('active');
    render(status === 'all' ? trips : trips.filter(function(t) { return t.status === status; }), status);
  };

  render(trips, 'all');
});
