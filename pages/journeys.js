/* Journey — Trip List Page */

safeRender(function() {
  var trips = loadTrips();
  var counts = {
    all: trips.length,
    planning: trips.filter(function(t) { return t.status === 'planning'; }).length,
    traveling: trips.filter(function(t) { return t.status === 'traveling'; }).length,
    completed: trips.filter(function(t) { return t.status === 'completed'; }).length
  };

  var tags = {
    planning: { cls: 'tag-amber', txt: '准备中' },
    traveling: { cls: 'tag-green', txt: '进行中' },
    completed: { cls: 'tag-gray', txt: '已完成' }
  };

  var iconMap = {
    planning: { icon: '📅', cls: 'blue' },
    traveling: { icon: '✈️', cls: 'green' },
    completed: { icon: '📖', cls: 'purple' }
  };

  // Update tab counts
  document.querySelectorAll('.tab').forEach(function(t, i) {
    var k = ['all', 'planning', 'traveling', 'completed'][i];
    t.textContent = t.textContent.replace(/\(.*?\)/, '(' + counts[k] + ')');
  });

  function render(list) {
    var c = document.getElementById('tripList');
    if (!list.length) {
      c.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><h3>暂无旅行</h3><p>开始你的第一段旅程吧</p><a href="create.html" class="btn btn-primary">+ 创建新旅行</a></div>';
      return;
    }
    c.innerHTML = list.map(function(t) {
      var ico = iconMap[t.status] || iconMap.planning;
      var preview = (t.days || []).slice(0, 4).reduce(function(arr, d) { return arr.concat(d.places || []); }, []).slice(0, 5).map(function(p) { return p.name; });
      var link = t.status === 'completed' ? 'journal.html?trip=' + t.id : 'trip-detail.html?id=' + t.id;
      return '<a href="' + link + '" class="card trip-card">' +
        '<div class="icon ' + ico.cls + '">' + ico.icon + '</div>' +
        '<div class="info">' +
          '<div style="display:flex;align-items:center;gap:8px;"><span class="name">' + t.name + '</span><span class="tag ' + tags[t.status].cls + '">' + tags[t.status].txt + '</span></div>' +
          '<div class="meta">' + t.startDate + ' - ' + t.endDate + ' · ' + (t.days instanceof Array ? t.days.length : t.days) + '天 · 👥 ' + (t.members || 1) + '人</div>' +
          (preview.length ? '<div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap;">' + preview.map(function(p) { return '<span style="font-size:11px;background:var(--muted);padding:2px 8px;border-radius:6px;color:var(--muted-fg);">' + p + '</span>'; }).join('') + '</div>' : '') +
        '</div><i class="fas fa-chevron-right" style="color:var(--border);"></i></a>';
    }).join('');
  }

  window.filterTrips = function(status, el) {
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    el.classList.add('active');
    render(status === 'all' ? trips : trips.filter(function(t) { return t.status === status; }));
  };

  render(trips);
});
