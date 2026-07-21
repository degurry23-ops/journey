/* Journey — Expenses Page */

safeRender(function() {
  var trip = getTripById(getParam('trip'));
  if (!trip) { showPageError('fa-wallet', '旅行不存在', '找不到这个行程', 'index.html', '返回首页'); return; }

  var el = document.getElementById('backLink');
  if (el) {
    el.href = 'trip-detail.html?id=' + trip.id;
    el.onclick = function(e) { e.preventDefault(); window.location.href = 'trip-detail.html?id=' + trip.id; };
  }

  if (!trip.expenses) trip.expenses = [];
  var expenses = trip.expenses;
  var total = expenses.reduce(function(s, e) { return s + e.amount; }, 0);
  var pp = total / (trip.members || 1);
  var catDefs = { '餐饮': '🍜', '交通': '🚇', '住宿': '🏨', '门票': '🎫', '购物': '🛍', '其他': '💊' };

  var cats = {};
  expenses.forEach(function(e) {
    if (!cats[e.cat]) cats[e.cat] = { total: 0, icon: catDefs[e.cat] || '💰' };
    cats[e.cat].total += e.amount;
  });

  function render() {
    var maxCat = Math.max.apply(Math, Object.values(cats).map(function(c) { return c.total; }).concat([1]));
    var h = '';
    h += '<div style="background:var(--fg);color:#fff;border-radius:16px;padding:24px;margin-bottom:16px;">';
    h += '<div style="font-size:13px;opacity:.7;">总消费</div><div style="font-size:2.5rem;font-weight:700;margin:4px 0;">¥' + total.toLocaleString() + '</div>';
    h += '<div style="display:flex;gap:20px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.1);"><div><span style="font-size:11px;opacity:.5;">人均</span><div style="font-weight:700;">¥' + Math.round(pp).toLocaleString() + '</div></div><div><span style="font-size:11px;opacity:.5;">笔数</span><div style="font-weight:700;">' + expenses.length + '</div></div></div></div>';

    if (Object.keys(cats).length) {
      h += '<div class="card" style="margin-bottom:16px;"><h3 style="font-size:12px;color:var(--muted-fg);margin-bottom:12px;">分类统计</h3>';
      Object.entries(cats).forEach(function(entry) {
        var k = entry[0], v = entry[1];
        h += '<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px;"><span>' + v.icon + ' ' + k + '</span><span style="font-weight:600;">¥' + v.total.toLocaleString() + '</span></div><div style="height:6px;background:var(--muted);border-radius:3px;"><div style="height:6px;border-radius:3px;background:var(--accent);width:' + (v.total / maxCat * 100) + '%;"></div></div></div>';
      });
      h += '</div>';
    }

    h += '<div style="display:flex;gap:4px;background:var(--muted);border-radius:999px;padding:3px;margin-bottom:16px;"><button class="btn btn-sm" style="flex:1;border-radius:999px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05);" onclick="renderList()">明细</button><button class="btn btn-sm" style="flex:1;border-radius:999px;color:var(--muted-fg);" onclick="showSplit()">结算</button></div>';
    h += '<div id="listArea"></div>';
    var content = document.getElementById('content');
    if (content) content.innerHTML = h;
    renderList();
  }

  window.renderList = function() {
    var area = document.getElementById('listArea');
    if (!area) return;
    var h = '<div class="card">';
    if (!expenses.length) {
      h += '<div class="empty-state" style="padding:20px;"><i class="fas fa-receipt"></i><h3>暂无消费记录</h3><p>点击右下角 + 添加第一笔</p></div>';
    } else {
      expenses.slice().reverse().forEach(function(e) {
        h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">';
        h += '<span style="font-size:22px;">' + (catDefs[e.cat] || '💰') + '</span>';
        h += '<div style="flex:1;"><div style="font-weight:600;font-size:14px;">' + (e.cat || '') + (e.note ? ' · ' + e.note : '') + '</div>';
        h += '<div style="font-size:11px;color:var(--muted-fg);">' + (e.payer || '我') + ' · ' + (e.date || '') + '</div></div>';
        h += '<span style="font-weight:700;">¥' + e.amount.toLocaleString() + '</span>';
        h += '<span onclick="removeExpense(\'' + e.id + '\')" style="color:var(--muted-fg);cursor:pointer;padding:4px;">✕</span></div>';
      });
    }
    h += '</div>';
    area.innerHTML = h;
  };

  window.showSplit = function() {
    var area = document.getElementById('listArea');
    if (!area) return;
    var h = '<div class="card"><h3 style="font-size:12px;color:var(--muted-fg);margin-bottom:16px;">AA 分摊</h3>';
    h += '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);"><span>总消费</span><span style="font-weight:700;">¥' + total.toLocaleString() + '</span></div>';
    h += '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);"><span>人数</span><span style="font-weight:700;">' + (trip.members || 1) + ' 人</span></div>';
    h += '<div style="display:flex;justify-content:space-between;padding:10px 0;"><span>每人应付</span><span style="font-weight:700;color:var(--accent);font-size:18px;">¥' + Math.round(pp).toLocaleString() + '</span></div></div>';
    area.innerHTML = h;
  };

  window.removeExpense = function(id) {
    showConfirm('确定删除这笔记录吗？', function() {
      trip.expenses = trip.expenses.filter(function(e) { return e.id !== id; });
      saveTrips(loadTrips().map(function(t) { return t.id === trip.id ? trip : t; }));
      location.reload();
    });
  };

  window.addExpense = function() {
    var aEl = document.getElementById('expAmt');
    var cEl = document.getElementById('expCat');
    var nEl = document.getElementById('expNote');
    var a = aEl ? aEl.value : '';
    var c = cEl ? cEl.value : '餐饮';
    var n = nEl ? nEl.value : '';
    if (!a || parseFloat(a) <= 0) { showToast('请输入有效金额', 'warning'); return; }
    trip.expenses.push({ id: 'e-' + Date.now(), amount: parseFloat(a), cat: c, note: n, payer: '我', date: new Date().toISOString().split('T')[0] });
    saveTrips(loadTrips().map(function(t) { return t.id === trip.id ? trip : t; }));
    showToast('已记录', 'success');
    setTimeout(function() { location.reload(); }, 400);
  };

  document.addEventListener('click', function(e) {
    if (e.target.id === 'addBtn') {
      var h = '<div class="sheet"><div class="sheet-handle"></div>';
      h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">';
      ['餐饮', '交通', '住宿', '门票', '购物', '其他'].forEach(function(c) {
        h += '<span onclick="event.target.style.background=\'var(--accent)\';event.target.style.color=\'#fff\';document.getElementById(\'expCat\').value=\'' + c + '\'" style="padding:5px 12px;border-radius:999px;font-size:12px;background:var(--muted);cursor:pointer;">' + (catDefs[c] || '💰') + ' ' + c + '</span>';
      });
      h += '</div><input type="hidden" id="expCat" value="餐饮">';
      h += '<input class="input" id="expAmt" type="number" placeholder="金额 ¥" style="margin-bottom:8px;font-size:20px;font-weight:700;" autofocus>';
      h += '<input class="input" id="expNote" placeholder="备注（可选）">';
      h += '<div style="display:flex;gap:8px;margin-top:12px;"><button onclick="this.parentElement.parentElement.remove()" class="btn btn-outline btn-full">取消</button><button onclick="addExpense()" class="btn btn-primary btn-full">记录</button></div></div>';
      var content = document.getElementById('content');
      if (content) content.insertAdjacentHTML('beforeend', h);
    }
  });

  render();
});
