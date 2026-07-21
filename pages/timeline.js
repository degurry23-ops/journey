/* Journey — Day Timeline Page */

safeRender(function() {
  var trip = getTripById(getParam('trip'));
  var dayId = getParam('day');
  if (!trip || !dayId) { showPageError('fa-route', '数据不存在', '请检查链接是否正确', 'index.html', '返回首页'); return; }

  if (!(trip.days instanceof Array)) trip.days = [];

  var dayIdx = trip.days.findIndex(function(d) { return d.id === dayId; });
  var day = trip.days[dayIdx];
  if (!day) {
    document.body.innerHTML = '<div class="empty-state" style="padding-top:100px;"><i class="fas fa-calendar"></i><h3>日程不存在</h3><a href="trip-detail.html?id=' + trip.id + '" class="btn btn-primary">返回行程</a></div>';
    return;
  }

  var el;
  el = document.getElementById('backLink');
  if (el) {
    el.href = 'trip-detail.html?id=' + trip.id;
    el.onclick = function(e) { e.preventDefault(); window.location.href = 'trip-detail.html?id=' + trip.id; };
  }
  el = document.getElementById('mapLink'); if (el) el.href = 'map.html?trip=' + trip.id;
  el = document.getElementById('expensesLink'); if (el) el.href = 'expenses.html?trip=' + trip.id;

  el = document.getElementById('dayTitle');
  if (el) el.innerHTML = '<div style="font-weight:600;">' + (trip.destination || '') + '之旅</div><div style="font-size:12px;color:var(--muted-fg);">Day ' + (dayIdx + 1) + ' · ' + (day.date || trip.startDate) + '</div>';

  el = document.getElementById('daySwitcher');
  if (el) el.innerHTML = trip.days.map(function(d, i) {
    return '<a href="day-timeline.html?trip=' + trip.id + '&day=' + d.id + '" style="padding:6px 14px;border-radius:999px;font-size:13px;font-weight:500;text-decoration:none;' + (d.id === dayId ? 'background:var(--accent);color:#fff;' : 'background:var(--muted);color:var(--muted-fg);') + '">Day ' + (i + 1) + '</a>';
  }).join('');

  var catIcon = { '景点': '🏯', '美食': '🍜', '咖啡': '☕', '购物': '🛍', '住宿': '🏨', '交通': '🚇', '其他': '📍' };
  var totalExp = (trip.expenses || []).filter(function(e) { return e.dayId === dayId; }).reduce(function(s, e) { return s + e.amount; }, 0);
  var weatherEmoji = day.weather && day.weather.indexOf('雨') >= 0 ? '🌧' : day.weather && day.weather.indexOf('多云') >= 0 ? '⛅' : '☀️';

  var html = '';
  html += '<div class="weather-bar" style="margin-bottom:20px;"><span style="font-size:32px;">' + weatherEmoji + '</span><div><div style="font-weight:600;">' + (day.weather || '☀️ 晴 25°C') + '</div><div style="font-size:13px;opacity:.85;margin-top:2px;">💡 ' + (day.tip || '今天天气不错，适合出行~') + '</div></div></div>';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h2 style="font-family:var(--font-display);font-size:1.2rem;">今日<span class="gradient-text">行程</span></h2><button class="btn btn-primary btn-sm" onclick="showAddForm()"><i class="fas fa-plus"></i> 添加</button></div>';

  if (!day.places || !day.places.length) {
    html += '<div class="empty-state" style="padding:30px;"><i class="fas fa-map-pin"></i><h3>还没有安排</h3><p>点击上方按钮添加第一个地点</p></div>';
  } else {
    html += '<div style="position:relative;padding-left:2px;">';
    day.places.forEach(function(p, i) {
      html += '<div class="timeline-item" style="position:relative;">';
      html += '<div class="timeline-dot"></div>';
      if (i < day.places.length - 1) html += '<div class="timeline-line"></div>';
      html += '<div class="card" style="flex:1;">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;">';
      html += '<div style="display:flex;align-items:center;gap:8px;">';
      html += '<span style="font-family:var(--font-mono);font-size:12px;color:var(--muted-fg);">' + (p.time || '09:00') + '</span>';
      html += '<span>' + (catIcon[p.cat] || '📍') + '</span>';
      html += '<span style="font-weight:600;font-size:14px;">' + p.name + '</span>';
      html += '<span class="tag tag-blue">' + (p.cat || '景点') + '</span></div>';
      html += '<span style="font-size:12px;color:var(--muted-fg);">' + (p.duration || '1h') + '</span></div>';
      html += '<div style="font-size:12px;color:var(--muted-fg);margin-top:4px;margin-left:48px;">' + (p.fee || '免费');
      if (p.lat) html += ' · <a href="https://uri.amap.com/marker?position=' + p.lng + ',' + p.lat + '&name=' + encodeURIComponent(p.name) + '" target="_blank" style="color:var(--accent);text-decoration:none;">📍 导航</a>';
      html += '<button onclick="removePlace(\'' + p.id + '\')" style="float:right;background:none;border:none;color:var(--muted-fg);cursor:pointer;font-size:14px;">✕</button>';
      html += '</div></div></div>';
    });
    html += '</div>';
  }

  if (totalExp > 0) {
    html += '<div class="card" style="display:flex;align-items:center;justify-content:space-between;margin-top:20px;"><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:20px;">💰</span><span style="font-size:14px;color:var(--muted-fg);">今日消费</span></div><div style="display:flex;align-items:center;gap:12px;"><span style="font-weight:700;font-size:16px;">¥' + totalExp.toLocaleString() + '</span><a href="expenses.html?trip=' + trip.id + '" class="btn btn-primary btn-sm">+ 记账</a></div></div>';
  }

  // Add place form (hidden)
  html += '<div id="addForm" class="sheet" style="display:none;"><div class="sheet-handle"></div>';
  html += '<input class="input" id="placeName" placeholder="地点名称" style="margin-bottom:8px;">';
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">';
  ['景点', '美食', '咖啡', '购物', '住宿', '交通', '其他'].forEach(function(c) {
    html += '<span onclick="selectCat(\'' + c + '\', this)" style="padding:5px 12px;border-radius:999px;font-size:12px;background:var(--muted);color:var(--muted-fg);cursor:pointer;">' + (catIcon[c] || '📍') + ' ' + c + '</span>';
  });
  html += '</div><input type="hidden" id="placeCat" value="景点">';
  html += '<div style="display:flex;gap:8px;margin-bottom:12px;"><input id="placeTime" class="input" placeholder="时间 (09:00)" style="flex:1;"><input id="placeDur" class="input" placeholder="时长 (1h)" style="flex:1;"></div>';
  html += '<div style="display:flex;gap:8px;"><button onclick="document.getElementById(\'addForm\').style.display=\'none\'" class="btn btn-outline btn-full">取消</button><button onclick="addPlace()" class="btn btn-primary btn-full">添加</button></div></div>';

  document.getElementById('content').innerHTML = html;

  window.showAddForm = function() {
    var f = document.getElementById('addForm');
    if (f) f.style.display = 'block';
  };

  window.selectCat = function(cat, el) {
    var btns = document.querySelectorAll('#addForm span[onclick^="selectCat"]');
    btns.forEach(function(b) { b.style.background = 'var(--muted)'; b.style.color = 'var(--muted-fg)'; });
    el.style.background = 'var(--accent)'; el.style.color = '#fff';
    var catInput = document.getElementById('placeCat');
    if (catInput) catInput.value = cat;
  };

  window.addPlace = function() {
    var nEl = document.getElementById('placeName');
    var n = nEl ? nEl.value.trim() : '';
    if (!n) { showToast('请输入地点名称', 'warning'); return; }
    var p = {
      id: 'p-' + Date.now(),
      name: n,
      cat: (document.getElementById('placeCat') || {}).value || '景点',
      time: (document.getElementById('placeTime') || {}).value || '09:00',
      duration: (document.getElementById('placeDur') || {}).value || '1h',
      fee: '免费'
    };
    if (!day.places) day.places = [];
    day.places.push(p);
    saveTrips(loadTrips().map(function(t) { return t.id === trip.id ? trip : t; }));
    location.reload();
  };

  window.removePlace = function(placeId) {
    day.places = day.places.filter(function(p) { return p.id !== placeId; });
    saveTrips(loadTrips().map(function(t) { return t.id === trip.id ? trip : t; }));
    location.reload();
  };
});
