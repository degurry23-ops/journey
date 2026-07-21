/* Journey — Trip Detail Page */

safeRender(function() {
  var trip = getTripById(getParam('id'));
  if (!trip) { showPageError('fa-map-signs', '旅行不存在', '找不到这个行程', 'journeys.html', '查看所有旅行'); return; }

  if (!(trip.days instanceof Array)) trip.days = [];

  // ── Dynamic Readiness (based on actual completion status) ──
  var checklist = {
    daysPlanned: trip.days.length >= daysBetween(trip.startDate, trip.endDate) + 1,
    membersAdded: (trip.members || 1) > 1,
    expensesSet: (trip.expenses || []).length > 0 || (trip.budget && trip.budget > 0),
    packingReady: (trip.packingList || []).length > 0,
    weatherChecked: true  // always has default weather
  };
  var completed = Object.values(checklist).filter(Boolean).length;
  var total = Object.keys(checklist).length;
  var readiness = Math.round(completed / total * 100);

  var rdBar = document.querySelector('.cover .animate-progress');
  if (rdBar) rdBar.style.width = readiness + '%';
  var rdPct = document.querySelector('.cover span[style*="font-weight:600"]');
  if (rdPct) rdPct.textContent = readiness + '%';

  // ── Weather Summary ──
  var weatherEl = document.getElementById('weatherSummary');
  if (weatherEl && trip.days.length > 0) {
    var weathers = trip.days.slice(0, 5).map(function(d) { return d.weather || '☀️'; }).join(' · ');
    weatherEl.textContent = '🌤 ' + weathers;
  }

  // ── Members List ──
  var membersList = document.getElementById('membersList');
  if (membersList) {
    var memberNames = trip.memberNames || [];
    // Ensure at least "我" (the creator) is shown
    if (memberNames.length === 0) memberNames.push('我');
    // Add placeholder slots up to members count
    while (memberNames.length < (trip.members || 1)) memberNames.push('');
    membersList.innerHTML = memberNames.map(function(name, i) {
      if (name) {
        return '<div style="display:flex;align-items:center;gap:8px;background:var(--muted);padding:8px 14px;border-radius:999px;">' +
          '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,' + (['#0052FF','#10B981','#F59E0B','#8B5CF6','#EC4899','#06B6D4'])[i] + ',' + (['#4D7CFF','#34D399','#FBBF24','#A78BFA','#F472B6','#22D3EE'])[i] + ');display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:600;">' + name[0] + '</div>' +
          '<span style="font-size:14px;font-weight:500;">' + name + (i === 0 ? ' <span style="font-size:11px;color:var(--muted-fg);">(创建者)</span>' : '') + '</span></div>';
      }
      return '<div style="display:flex;align-items:center;gap:8px;background:var(--muted);padding:8px 14px;border-radius:999px;border:1.5px dashed var(--border);cursor:pointer;" onclick="inviteMember()">' +
        '<div style="width:32px;height:32px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;color:var(--muted-fg);font-size:14px;">?</div>' +
        '<span style="font-size:13px;color:var(--muted-fg);">待邀请</span></div>';
    }).join('');
  }

  // ── Packing List ──
  renderPackingList(trip);

  // ── Days & rest of page ──
  el = document.getElementById('tripTitle');
  if (el) el.innerHTML = (trip.destination || '') + '<span class="gradient-text">之旅</span>';

  el = document.getElementById('tripMeta');
  if (el) el.textContent = trip.startDate + ' - ' + trip.endDate + ' · ' + (trip.days instanceof Array ? trip.days.length : (trip.days || 0)) + '天 · 👥 ' + (trip.members || 1) + '人';

  var statusTag = document.getElementById('tripStatus');
  if (statusTag) {
    var st = trip.status;
    statusTag.className = 'tag ' + (st === 'traveling' ? 'tag-green' : st === 'completed' ? 'tag-gray' : 'tag-amber');
    statusTag.textContent = st === 'traveling' ? '进行中' : st === 'completed' ? '已完成' : '准备中';
  }

  // (Readiness bar already set above with dynamic value)

  var daysEl = document.getElementById('days');
  if (daysEl && trip.days instanceof Array) {
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

  document.querySelectorAll('.action-btn').forEach(function(a) {
    var href = a.getAttribute('href');
    if (href) a.setAttribute('href', href + '?trip=' + trip.id);
  });

  var btnArea = document.getElementById('actionBtn');
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

  /* Invite Member */
  window.inviteMember = function() {
    var shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(function() {
        showToast('行程链接已复制，发送给朋友即可加入', 'success');
      });
    } else {
      var input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast('行程链接已复制！', 'success');
    }
  };

  function renderPackingList(trip) {
    var list = trip.packingList || getDefaultPackingList(trip);
    var container = document.getElementById('packingList');
    if (!container) return;
    var categories = {'证件':[],'衣物':[],'电子':[],'洗漱':[],'药品':[],'其他':[]};
    list.forEach(function(item) {
      var cat = item.cat || '其他';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    });
    var html = '';
    Object.keys(categories).forEach(function(cat) {
      if (!categories[cat].length) return;
      html += '<div style="margin-bottom:8px;"><div style="font-size:11px;color:var(--muted-fg);margin-bottom:4px;font-weight:600;">' + cat + '</div>';
      categories[cat].forEach(function(item) {
        html += '<label style="display:flex;align-items:center;gap:6px;font-size:13px;padding:4px 0;cursor:pointer;">' +
          '<input type="checkbox" style="accent-color:var(--accent);"' + (item.checked?' checked':'') + ' onchange="togglePackItem(\'' + item.id + '\')">' +
          '<span style="' + (item.checked?'text-decoration:line-through;color:var(--muted-fg);':'') + '">' + item.name + '</span>' +
          (item.note?'<span style="font-size:11px;color:var(--muted-fg);">' + item.note + '</span>':'') +
          '</label>';
      });
      html += '</div>';
    });
    container.innerHTML = html;
  }

  function getDefaultPackingList(trip) {
    var days = trip.days instanceof Array ? trip.days.length : 4;
    var hasRain = trip.days.some(function(d) { return d.weather && d.weather.indexOf('雨') >= 0; });
    var isHot = trip.days.some(function(d) { return d.weather && d.weather.indexOf && d.weather.indexOf('28') >= 0 || d.weather.indexOf('30') >= 0 || d.weather.indexOf('32') >= 0; });
    var list = [
      {id:'pk-1',name:'护照/身份证',cat:'证件',checked:false,note:'必带'},
      {id:'pk-2',name:'机票/酒店确认单',cat:'证件',checked:false},
      {id:'pk-3',name:'T恤 x' + Math.min(days,5),cat:'衣物',checked:false},
      {id:'pk-4',name:'外套 x1',cat:'衣物',checked:false},
      {id:'pk-5',name:'舒适步行鞋',cat:'衣物',checked:false},
      {id:'pk-6',name:'手机 + 充电器',cat:'电子',checked:false},
      {id:'pk-7',name:'充电宝',cat:'电子',checked:false},
      {id:'pk-8',name:'牙刷/牙膏',cat:'洗漱',checked:false},
      {id:'pk-9',name:'防晒霜',cat:'洗漱',checked:false,note:isHot?'必须':''},
      {id:'pk-10',name:'常用药品',cat:'药品',checked:false},
      {id:'pk-11',name:'创可贴',cat:'药品',checked:false},
      {id:'pk-12',name:'现金/银行卡',cat:'其他',checked:false}
    ];
    if (hasRain) list.push({id:'pk-13',name:'雨伞/雨衣',cat:'其他',checked:false,note:'有雨'});
    if (isHot) list.push({id:'pk-14',name:'太阳镜',cat:'衣物',checked:false},{id:'pk-15',name:'防晒衣',cat:'衣物',checked:false});
    return list;
  }

  window.generatePackingList = function() {
    trip.packingList = getDefaultPackingList(trip);
    renderPackingList(trip);
    saveTrips(loadTrips().map(function(t) { return t.id === trip.id ? trip : t; }));
    showToast('行李清单已生成', 'success');
  };

  window.togglePackItem = function(itemId) {
    if (!trip.packingList) trip.packingList = getDefaultPackingList(trip);
    var item = trip.packingList.find(function(i) { return i.id === itemId; });
    if (item) item.checked = !item.checked;
    saveTrips(loadTrips().map(function(t) { return t.id === trip.id ? trip : t; }));
    renderPackingList(trip);
  };
});
