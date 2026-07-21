/* Journey — Home Page (v3 — AI Travel Companion) */

safeRender(function() {
  var trips = loadTrips();
  var upcoming = trips.filter(function(t) { return t.status === 'planning'; });
  var active = trips.filter(function(t) { return t.status === 'traveling'; });
  var completed = trips.filter(function(t) { return t.status === 'completed'; });
  var next = upcoming[0];
  var activeTrip = active[0];

  // ── Hero: AI-first design ──
  var todayDate = new Date().toISOString().split('T')[0];
  if (next) {
    var daysLeft = Math.max(0, daysBetween(todayDate, next.startDate));
    var dayCount = next.days instanceof Array ? next.days.length : 0;
    var placeCount = next.days instanceof Array ? next.days.reduce(function(s, d) { return s + (d.places ? d.places.length : 0); }, 0) : 0;
    var heroContent = document.getElementById('heroContent');
    if (heroContent) {
      heroContent.innerHTML =
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">' +
          '<div style="width:40px;height:40px;border-radius:var(--radius);background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;">🤖</div>' +
          '<div><div style="font-weight:600;font-size:14px;">AI 旅行助手</div><div style="font-size:12px;color:var(--muted-fg);">你的' + (next.destination || '') + '旅行正在完善中</div></div>' +
        '</div>' +
        '<h1 style="font-family:var(--font-display);font-size:clamp(2.2rem,5vw,3.2rem);line-height:1.12;margin-bottom:8px;">' + (next.emoji || '🌏') + ' ' + (next.destination || '') + '<span class="gradient-text"> · ' + dayCount + '日</span></h1>' +
        '<p style="font-size:16px;color:var(--muted-fg);margin-bottom:24px;">' + next.startDate + ' 出发 · ' + daysLeft + '天后 · 👥 ' + (next.members || 1) + '人</p>' +
        // AI status card
        '<div style="background:linear-gradient(135deg,#F8FAFC,#F0F4FF);border:1px solid rgba(0,82,255,.1);border-radius:var(--radius-lg);padding:20px 24px;margin-bottom:20px;">' +
          '<div style="font-size:12px;color:var(--muted-fg);text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px;">AI 已完成</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">' +
            '<div style="display:flex;align-items:center;gap:6px;font-size:14px;">✓ <span>' + dayCount + '天路线规划</span></div>' +
            '<div style="display:flex;align-items:center;gap:6px;font-size:14px;">✓ <span>' + placeCount + '个地点推荐</span></div>' +
            '<div style="display:flex;align-items:center;gap:6px;font-size:14px;">✓ <span>预算方案 ¥' + ((next.budget || 5000) * (next.members || 1) / 1000).toFixed(1) + 'k</span></div>' +
            '<div style="display:flex;align-items:center;gap:6px;font-size:14px;">✓ <span>行李清单生成</span></div>' +
          '</div>' +
          '<div style="font-size:13px;color:var(--accent);display:flex;align-items:center;gap:6px;">' +
            '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse-dot 2s infinite;"></span>' +
            '下一步：' + (dayCount < 5 ? '补充每日行程细节' : (next.expenses && next.expenses.length ? '确认出发准备清单' : '添加预算和消费计划')) +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<a href="trip-detail.html?id=' + next.id + '" class="btn btn-primary btn-lg">继续优化旅行 <i class="fas fa-arrow-right"></i></a>' +
          '<a href="create.html" class="btn btn-outline btn-lg">规划新旅行</a>' +
        '</div>';
    }
  }

  // ── Active Journey card (action-oriented) ──
  var activeSection = document.getElementById('activeSection');
  if (activeTrip && activeSection) {
    activeSection.style.display = 'block';
    var nameEl = document.getElementById('activeTripName');
    var metaEl = document.getElementById('activeTripMeta');
    var emojiEl = document.getElementById('activeEmoji');
    var tlLink = document.getElementById('activeTimelineLink');
    var mapLink = document.getElementById('activeMapLink');
    var expLink = document.getElementById('activeExpenseLink');

    var dayCount = activeTrip.days instanceof Array ? activeTrip.days.length : 1;
    var todayDay = activeTrip.days instanceof Array ? activeTrip.days[0] : null;
    var places = todayDay && todayDay.places ? todayDay.places : [];

    if (nameEl) nameEl.textContent = activeTrip.name + ' · Day' + dayCount;
    if (emojiEl) emojiEl.textContent = activeTrip.emoji || '✈️';

    // Build time-based route
    var routeHTML = '';
    if (places.length) {
      routeHTML = '<div style="margin-top:16px;position:relative;padding-left:16px;">' +
        places.map(function(p, i) {
          return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:14px;">' +
            '<span style="font-family:var(--font-mono);font-size:12px;color:rgba(255,255,255,.5);min-width:44px;">' + (p.time || '09:00') + '</span>' +
            '<span style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.4);flex-shrink:0;"></span>' +
            '<span style="opacity:.85;">' + p.name + '</span>' +
          '</div>';
        }).join('') + '</div>';
    }
    if (metaEl) metaEl.innerHTML = (todayDay ? '<div style="display:flex;align-items:center;gap:12px;font-size:14px;opacity:.7;"><span>' + (todayDay.weather || '☀️') + '</span></div>' : '') + routeHTML;

    if (tlLink) { tlLink.href = 'today.html?trip=' + activeTrip.id; tlLink.textContent = '📋 今日旅程'; }
    if (mapLink) mapLink.href = 'map.html?trip=' + activeTrip.id;
    if (expLink) expLink.href = 'expenses.html?trip=' + activeTrip.id;

    // Replace button area with "enter today" CTA
    var btnArea = activeSection.querySelector('.btn-sm');
    var btnContainer = activeSection.querySelector('[style*="display:flex;gap:8px;margin-top:20px"]');
    if (btnContainer) {
      btnContainer.innerHTML = '<a href="today.html?trip=' + activeTrip.id + '" class="btn btn-sm" style="background:rgba(255,255,255,.2);color:#fff;">进入今日旅程 →</a>' +
        '<a href="map.html?trip=' + activeTrip.id + '" class="btn btn-sm" style="background:rgba(255,255,255,.1);color:#fff;">🗺</a>' +
        '<a href="expenses.html?trip=' + activeTrip.id + '" class="btn btn-sm" style="background:rgba(255,255,255,.1);color:#fff;">💰</a>';
    }

    var card = document.getElementById('activeTripCard');
    if (card) { card.onclick = function() { location.href = 'today.html?trip=' + activeTrip.id; }; }
  }

  // ── Travel Footprint Stats ──
  var totalCities = new Set(trips.map(function(t) { return t.destination; })).size;
  var totalPlaces = trips.reduce(function(s, t) {
    return s + (t.days instanceof Array ? t.days.reduce(function(ds, d) { return ds + (d.places ? d.places.length : 0); }, 0) : 0);
  }, 0);
  var totalPhotos = trips.reduce(function(s, t) {
    var photos = loadPhotos(t.id);
    return s + (photos ? photos.length : 0);
  }, 0);
  var totalMemories = completed.length;

  var statMap = { statCities: totalCities, statPlaces: totalPlaces, statPhotos: totalPhotos, statMemories: totalMemories };
  Object.keys(statMap).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = statMap[id];
  });

  // ── Travel Memories (with AI summary) ──
  var memoriesGrid = document.getElementById('memoriesGrid');
  if (memoriesGrid) {
    var destColors = { '日本东京': '#E53E3E', '四川成都': '#DD6B20', '上海': '#3182CE', '云南大理': '#38A169' };
    var destBgs = { '日本东京': 'linear-gradient(135deg,#FFF0F0,#FFE0E0)', '四川成都': 'linear-gradient(135deg,#FFF5EB,#FFE8CC)', '上海': 'linear-gradient(135deg,#EBF4FF,#DBEAFE)', '云南大理': 'linear-gradient(135deg,#ECFDF5,#D1FAE5)' };

    if (completed.length) {
      memoriesGrid.innerHTML = completed.map(function(t) {
        var bg = destBgs[t.destination] || 'linear-gradient(135deg,#F8FAFC,#F1F5F9)';
        var color = destColors[t.destination] || 'var(--accent)';
        var summary = t.summary ? (t.summary.length > 60 ? t.summary.slice(0, 60) + '...' : t.summary) : '';
        var placeCount = t.days instanceof Array ? t.days.reduce(function(s, d) { return s + (d.places ? d.places.length : 0); }, 0) : 0;
        var photoCount = (loadPhotos(t.id) || []).length;
        return '<a href="journal.html?trip=' + t.id + '" class="memory-card" style="background:' + bg + ';border-radius:var(--radius-lg);padding:0;overflow:hidden;text-decoration:none;color:inherit;display:block;transition:all .25s;cursor:pointer;">' +
          '<div style="padding:24px 20px 16px;">' +
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">' +
              '<span style="font-size:36px;">' + (t.emoji || '📖') + '</span>' +
              '<div>' +
                '<div style="font-weight:700;font-size:16px;">' + t.name + '</div>' +
                '<div style="font-size:12px;color:var(--muted-fg);">' + (t.startDate || '').slice(0, 7) + ' · ' + (placeCount || (t.days instanceof Array ? t.days.length : 0)) + '天' + (photoCount > 0 ? ' · ' + photoCount + '张照片' : '') + '</div>' +
              '</div>' +
            '</div>' +
            (summary ? '<p style="font-size:12px;color:var(--muted-fg);line-height:1.5;margin-bottom:10px;">' + summary + '</p>' : '<p style="font-size:12px;color:var(--muted-fg);line-height:1.5;margin-bottom:10px;font-style:italic;">一段值得珍藏的旅程</p>') +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;">' + (t.tags || t.highlights || ['旅行']).slice(0, 3).map(function(tg) {
              return '<span style="font-size:11px;background:rgba(255,255,255,.6);padding:2px 10px;border-radius:999px;color:' + color + ';">' + tg + '</span>';
            }).join('') + '</div>' +
          '</div>' +
          '<div style="height:3px;background:' + color + ';width:100%;opacity:.5;"></div>' +
        '</a>';
      }).join('');
      // "Start new" card
      memoriesGrid.innerHTML += '<a href="create.html" class="memory-card" style="background:var(--muted);border-radius:var(--radius-lg);padding:24px 20px;text-decoration:none;color:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:180px;border:2px dashed var(--border);transition:all .2s;cursor:pointer;">' +
        '<i class="fas fa-plus" style="font-size:24px;color:var(--muted-fg);margin-bottom:8px;"></i>' +
        '<span style="font-weight:600;font-size:14px;">开始新的旅程</span>' +
        '<span style="font-size:11px;color:var(--muted-fg);margin-top:2px;">AI 帮你规划</span></a>';
    } else {
      memoriesGrid.innerHTML = '<a href="create.html" class="memory-card" style="background:linear-gradient(135deg,rgba(0,82,255,.03),rgba(77,124,255,.03));border-radius:var(--radius-lg);padding:40px 24px;text-decoration:none;color:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:180px;border:2px dashed rgba(0,82,255,.15);transition:all .2s;cursor:pointer;grid-column:1/-1;">' +
        '<span style="font-size:48px;margin-bottom:12px;">🌅</span>' +
        '<span style="font-weight:700;font-size:18px;margin-bottom:4px;">你的下一段故事还没有开始</span>' +
        '<span style="font-size:14px;color:var(--muted-fg);margin-bottom:16px;">让 AI 帮你规划第一次旅行</span>' +
        '<span class="btn btn-primary btn-sm">开始探索</span></a>';
    }
  }
});
