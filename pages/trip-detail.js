/* Journey — Trip Detail Page */

safeRender(function() {
  var trip = getTripById(getParam('id'));
  if (!trip) {
    document.body.innerHTML = '<div class="empty-state" style="padding-top:100px;"><i class="fas fa-map-signs"></i><h3>旅行不存在</h3><p>找不到这个行程，可能已被删除</p><a href="journeys.html" class="btn btn-primary">查看所有旅行</a></div>';
    return;
  }

  document.getElementById('tripTitle').innerHTML = (trip.destination || '') + '<span class="gradient-text">之旅</span>';
  document.getElementById('tripMeta').textContent = trip.startDate + ' - ' + trip.endDate + ' · ' + trip.days.length + '天 · 👥 ' + (trip.members || 1) + '人';
  var statusTag = document.getElementById('tripStatus');
  var st = trip.status;
  statusTag.className = 'tag ' + (st === 'traveling' ? 'tag-green' : st === 'completed' ? 'tag-gray' : 'tag-amber');
  statusTag.textContent = st === 'traveling' ? '进行中' : st === 'completed' ? '已完成' : '准备中';

  // Readiness
  var readiness = trip.readiness || 30;
  var rdBar = document.querySelector('.cover .animate-progress');
  if (rdBar) rdBar.style.width = readiness + '%';
  var rdPct = document.querySelector('.cover span[style*="font-weight:600"]');
  if (rdPct) rdPct.textContent = readiness + '%';

  // Day list
  var daysEl = document.getElementById('days');
  if (daysEl) {
    daysEl.innerHTML = trip.days.map(function(d, i) {
      return '<a href="day-timeline.html?trip=' + trip.id + '&day=' + d.id + '" class="card day-card">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span class="tag tag-blue">Day ' + (i + 1) + '</span>' +
            '<span style="font-size:14px;">' + (d.weather || '🌤') + '</span>' +
          '</div>' +
          '<span style="font-size:13px;color:var(--muted-fg);">' + (d.places ? d.places.length : 0) + ' 个地点 →</span>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">' + (d.places || []).map(function(p) {
          return '<span style="font-size:12px;background:var(--muted);padding:3px 8px;border-radius:6px;color:var(--muted-fg);">' + (p.time || '') + ' ' + p.name + '</span>';
        }).join('') + '</div>' +
      '</a>';
    }).join('');
  }

  // Quick action links
  document.querySelectorAll('.action-btn').forEach(function(a) {
    var href = a.getAttribute('href');
    if (href) a.setAttribute('href', href + '?trip=' + trip.id);
  });

  // Bottom action button
  var btnArea = document.querySelector('main > a.btn, main > .btn-full');
  if (btnArea) {
    if (trip.status === 'planning') {
      btnArea.textContent = '✈️ 开始旅行';
      btnArea.onclick = function(e) {
        e.preventDefault();
        updateTrip(trip.id, { status: 'traveling', readiness: Math.max(trip.readiness || 30, 80) });
        location.reload();
      };
    } else if (trip.status === 'traveling') {
      btnArea.textContent = '🏁 结束旅行，生成日志';
      btnArea.onclick = function(e) {
        e.preventDefault();
        showConfirm('结束旅行后将生成旅行日志，确定吗？', function() {
          updateTrip(trip.id, { status: 'completed', readiness: 100 });
          location.href = 'journal.html?trip=' + trip.id;
        });
      };
    } else {
      btnArea.textContent = '📖 查看旅行日志';
      btnArea.href = 'journal.html?trip=' + trip.id;
    }
  }

  // Delete trip button
  var deleteBtn = document.getElementById('deleteTripBtn');
  if (deleteBtn) {
    deleteBtn.onclick = function() {
      showConfirm('删除后将无法恢复，确定删除「' + trip.name + '」吗？', function() {
        deleteTrip(trip.id);
        showToast('已删除', 'success');
        setTimeout(function() { location.href = 'journeys.html'; }, 500);
      });
    };
  }
});
