/* Journey — Journal Page */

safeRender(function() {
  var trip = getTripById(getParam('trip'));
  if (!trip) {
    document.body.innerHTML = '<div class="empty-state" style="padding-top:100px;"><i class="fas fa-book"></i><h3>旅行不存在</h3><a href="index.html" class="btn btn-primary">返回首页</a></div>';
    return;
  }

  var tripData = {
    dates: trip.startDate + ' - ' + trip.endDate,
    days: (trip.days || []).map(function(d, i) {
      return {
        day: i + 1,
        w: d.weather || '☀️ 晴',
        places: (d.places || []).map(function(p) { return p.name; }).join(' → ') || '自由探索'
      };
    }),
    stats: {
      days: trip.days ? trip.days.length : 0,
      places: (trip.days || []).reduce(function(s, d) { return s + (d.places ? d.places.length : 0); }, 0),
      expense: (trip.expenses || []).reduce(function(s, e) { return s + e.amount; }, 0),
      members: trip.members || 1,
      walk: '--',
      farthest: (trip.days || [])[0] && (trip.days[0].places || [])[0] ? trip.days[0].places[0].name : '--'
    },
    summary: trip.summary || trip.aiSummary || 'AI 总结尚未生成，点击下方按钮生成',
    tags: trip.tags || trip.highlights || ['旅行', '回忆'],
    expenseData: ['餐饮', '交通', '住宿', '门票', '购物', '其他'].map(function(cat) {
      return {
        name: cat,
        value: (trip.expenses || []).filter(function(e) { return e.cat === cat; }).reduce(function(s, e) { return s + e.amount; }, 0)
      };
    }).filter(function(d) { return d.value > 0; }),
    photos: loadPhotos(trip.id)
  };

  var colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#0052FF', '#EC4899'];

  document.getElementById('coverTitle').innerHTML = trip.name.replace('之旅', '<span class="gradient-text">之旅</span>');
  document.getElementById('coverDates').textContent = tripData.dates;

  document.getElementById('statsGrid').innerHTML =
    '<div class="stat-item"><div class="icon">📅</div><div class="value">' + tripData.stats.days + ' <span style="font-size:14px;color:var(--muted-fg);">天</span></div><div class="label">旅行天数</div></div>' +
    '<div class="stat-item"><div class="icon">📍</div><div class="value">' + tripData.stats.places + '</div><div class="label">打卡地点</div></div>' +
    '<div class="stat-item"><div class="icon">💰</div><div class="value">¥<span>' + tripData.stats.expense.toLocaleString() + '</span></div><div class="label">总消费</div></div>' +
    '<div class="stat-item"><div class="icon">👥</div><div class="value">' + tripData.stats.members + '</div><div class="label">同行人数</div></div>' +
    '<div class="stat-item"><div class="icon">👣</div><div class="value">' + tripData.stats.walk + '</div><div class="label">总步行</div></div>' +
    '<div class="stat-item"><div class="icon">🏆</div><div class="value">' + tripData.stats.farthest + '</div><div class="label">最远打卡</div></div>';

  document.getElementById('dailyRecap').innerHTML = tripData.days.map(function(d, i) {
    return '<div style="display:flex;gap:12px;' + (i < tripData.days.length - 1 ? 'margin-bottom:16px' : '') + '">' +
      '<div style="display:flex;flex-direction:column;align-items:center;">' +
        '<div style="width:10px;height:10px;border-radius:50%;background:' + (i === 0 ? 'var(--accent)' : 'var(--accent2)') + ';border:2px solid #fff;box-shadow:0 0 0 2px ' + (i === 0 ? 'var(--accent)' : 'var(--accent2)') + ';"></div>' +
        (i < tripData.days.length - 1 ? '<div style="width:2px;flex:1;background:var(--border);margin:4px 0;"></div>' : '') +
      '</div>' +
      '<div style="flex:1;padding-bottom:' + (i < tripData.days.length - 1 ? '12px' : '0') + ';">' +
        '<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;">' +
          '<span class="tag tag-blue">Day ' + d.day + '</span>' +
          '<span style="font-size:12px;color:var(--muted-fg);">' + d.w + '</span>' +
        '</div>' +
        '<p style="font-size:14px;color:var(--muted-fg);">' + d.places + '</p>' +
      '</div></div>';
  }).join('');

  function showSummary() {
    document.getElementById('aiSummary').textContent = tripData.summary;
    document.getElementById('aiTags').innerHTML = (tripData.tags || []).map(function(tg) {
      return '<span class="tag tag-blue">' + tg + '</span>';
    }).join('');
  }

  showSummary();

  // AI regenerate
  window.regenerateAI = async function() {
    document.getElementById('aiSummary').textContent = '🤖 AI 正在生成...';
    var data = {
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      numDays: trip.days ? trip.days.length : trip.stats ? trip.stats.days : 0,
      members: trip.members || (trip.stats ? trip.stats.members : 1),
      places: (trip.days || []).reduce(function(arr, d) { return arr.concat((d.places || []).map(function(p) { return p.name; })); }, []),
      expenses: trip.expenses || [],
      highlights: tripData.tags || []
    };
    var aiResult = await callAIJournal(data);
    if (aiResult && aiResult.coverSummary) {
      trip.summary = aiResult.coverSummary;
      trip.tags = aiResult.highlights || [];
      tripData.summary = aiResult.coverSummary;
      tripData.tags = aiResult.highlights || [];
      showSummary();
      saveTrips(loadTrips().map(function(t) { return t.id === trip.id ? trip : t; }));
    } else {
      document.getElementById('aiSummary').textContent = 'AI 生成失败，请重试';
    }
  };

  // Photos
  var photosEl = document.getElementById('photos');
  if (photosEl) {
    var allPhotos = tripData.photos;
    // Add default Unsplash photos
    var defaultUnsplash = ['1508804185872-d7badad00f7d', '1547981609-4b6bfe67ca0b', '1476514525535-07fb3b4ae5f1', '1469854523086-cc02fe5d8800', '1488646953014-85cb44e25828', '1527631746610-bca00a040d60'];
    var dataUrls = allPhotos.map(function(p) { return p.dataUrl; });
    var photosHtml = dataUrls.map(function(url) {
      return '<div class="photo-item" onclick="openPhoto(\'' + url + '\')"><img src="' + url + '" alt="旅行照片" loading="lazy"></div>';
    }).join('');

    if (dataUrls.length === 0) {
      photosHtml = defaultUnsplash.map(function(id) {
        var url = 'https://images.unsplash.com/photo-' + id + '?w=400&q=80';
        return '<div class="photo-item"><img src="' + url + '" alt="旅行照片" loading="lazy"></div>';
      }).join('');
    }
    photosHtml += '<div class="photo-item" onclick="document.getElementById(\'photoInput\').click()" style="cursor:pointer;background:var(--muted);"><i class="fas fa-plus" style="font-size:24px;color:var(--muted-fg);"></i></div>';
    photosEl.innerHTML = photosHtml;
  }

  // Expense chart
  document.addEventListener('DOMContentLoaded', function() {
    var chartDom = document.getElementById('expenseChart');
    if (!chartDom || !tripData.expenseData.length) return;
    var chart = echarts.init(chartDom);
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
      series: [{
        type: 'pie',
        radius: ['55%', '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n¥{c}' },
        data: tripData.expenseData.map(function(d, i) {
          return Object.assign({}, d, { itemStyle: { color: colors[i % colors.length] } });
        })
      }]
    });
    window.addEventListener('resize', function() { chart.resize(); });
  });

  // Photo upload
  window.triggerPhotoUpload = function() {
    document.getElementById('photoInput').click();
  };

  window.handlePhotoUpload = function(input) {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      savePhoto(trip.id, e.target.result);
      showToast('照片已保存', 'success');
      setTimeout(function() { location.reload(); }, 500);
    };
    reader.readAsDataURL(file);
  };

  window.openPhoto = function(url) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:200;display:flex;align-items:center;justify-content:center;cursor:pointer;animation:fadeIn 0.2s;';
    overlay.innerHTML = '<img src="' + url + '" style="max-width:90vw;max-height:90vh;border-radius:8px;object-fit:contain;">';
    overlay.onclick = function() { overlay.remove(); };
    document.body.appendChild(overlay);
  };
});
