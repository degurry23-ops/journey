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
  var budgetPerPerson = parseInt(trip.budget) || 0;
  var budgetTotal = budgetPerPerson * (trip.members || 1);
  var cur = getCurrency(trip.destination);
  // Convert total to CNY for budget comparison if foreign currency
  var totalCNY = Math.round(total * cur.rate);
  var budgetUsed = budgetTotal > 0 ? Math.round(totalCNY / budgetTotal * 100) : 0;
  var isForeign = cur.code !== 'CNY';
  var catDefs = { '餐饮': '🍜', '交通': '🚇', '住宿': '🏨', '门票': '🎫', '购物': '🛍', '其他': '💊' };

  var cats = {};
  expenses.forEach(function(e) {
    if (!cats[e.cat]) cats[e.cat] = { total: 0, icon: catDefs[e.cat] || '💰' };
    cats[e.cat].total += e.amount;
  });

  function render() {
    var maxCat = Math.max.apply(Math, Object.values(cats).map(function(c) { return c.total; }).concat([1]));
    var h = '';
    // ── Hero: CNY-first display ──
    h += '<div style="background:var(--fg);color:#fff;border-radius:16px;padding:24px;margin-bottom:16px;">';
    h += '<div style="font-size:13px;opacity:.7;">💰 本次旅行花费</div>';
    if (isForeign) {
      h += '<div style="font-size:2.2rem;font-weight:700;margin:4px 0;">¥' + totalCNY.toLocaleString() + ' <span style="font-size:14px;opacity:.7;">CNY</span></div>';
      h += '<div style="font-size:14px;opacity:.5;margin-bottom:4px;">≈ ' + cur.sym + total.toLocaleString() + ' ' + cur.code + '</div>';
    } else {
      h += '<div style="font-size:2.5rem;font-weight:700;margin:4px 0;">' + cur.sym + total.toLocaleString() + '</div>';
    }
    h += '<div style="display:flex;gap:16px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.1);">';
    h += '<div><span style="font-size:11px;opacity:.5;">人均</span><div style="font-weight:700;">' + (isForeign ? '¥' + Math.round(pp * cur.rate).toLocaleString() : cur.sym + Math.round(pp).toLocaleString()) + '</div></div>';
    h += '<div><span style="font-size:11px;opacity:.5;">笔数</span><div style="font-weight:700;">' + expenses.length + '</div></div>';
    if (isForeign) h += '<div><span style="font-size:11px;opacity:.5;">汇率</span><div style="font-weight:700;font-size:13px;">1 ' + cur.code + ' ≈ ' + cur.rate + ' CNY</div></div>';
    h += '</div>';
    // Budget
    if (budgetTotal > 0) {
      var alertColor = budgetUsed >= 100 ? '#EF4444' : budgetUsed >= 80 ? '#F59E0B' : '#10B981';
      var remain = budgetTotal - totalCNY;
      h += '<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.1);">';
      h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;opacity:.7;">预算剩余</span><span style="font-size:13px;font-weight:600;color:' + alertColor + ';">¥' + Math.max(0, remain).toLocaleString() + '</span></div>';
      h += '<div style="height:6px;background:rgba(255,255,255,.15);border-radius:3px;overflow:hidden;">';
      h += '<div style="height:100%;width:' + Math.min(budgetUsed, 100) + '%;background:#fff;border-radius:3px;transition:width .5s;"></div></div>';
      h += '<div style="font-size:11px;opacity:.5;margin-top:4px;">总预算 ¥' + budgetTotal.toLocaleString() + ' · 已用 ' + budgetUsed + '%</div></div>';
    }
    h += '</div>';

    // ── AI analysis ──
    if (Object.keys(cats).length) {
      var topCat = Object.entries(cats).sort(function(a,b){return b[1].total-a[1].total;})[0];
      var topPct = Math.round(topCat[1].total / total * 100);
      var style = topPct > 60 ? (topCat[0] === '门票' ? '体验优先型' : topCat[0] === '餐饮' ? '美食探索型' : topCat[0] === '购物' ? '购物达人型' : '均衡型') : '均衡型';
      h += '<div class="card" style="margin-bottom:16px;background:linear-gradient(135deg,#F8FAFF,#FFF);border:1px solid rgba(0,82,255,.08);">';
      h += '<div style="display:flex;gap:10px;align-items:flex-start;">';
      h += '<span style="font-size:18px;">🤖</span>';
      h += '<div><div style="font-weight:600;font-size:13px;margin-bottom:4px;">AI 消费分析</div>';
      h += '<p style="font-size:12px;color:var(--muted-fg);line-height:1.6;">你的' + (trip.destination||'') + '旅行属于<strong>' + style + '</strong>。' + topCat[1].icon + ' ' + topCat[0] + '占' + topPct + '%，是最大支出。';
      if (budgetTotal > 0 && budgetUsed > 80) h += '预算已用' + budgetUsed + '%，建议控制后续花费。';
      else if (budgetTotal > 0) h += '预算使用正常，剩余 ¥' + Math.max(0, budgetTotal - totalCNY).toLocaleString() + ' 可供继续使用。';
      h += '</p></div></div></div>';
    }

    // ── Category bars with percentages ──
    if (Object.keys(cats).length) {
      h += '<div class="card" style="margin-bottom:16px;"><h3 style="font-size:12px;color:var(--muted-fg);margin-bottom:12px;">消费结构</h3>';
      var colors2 = ['#0052FF','#10B981','#F59E0B','#8B5CF6','#EF4444','#EC4899'];
      var ci = 0;
      Object.entries(cats).sort(function(a,b){return b[1].total-a[1].total;}).forEach(function(entry) {
        var k = entry[0], v = entry[1];
        var pct = Math.round(v.total / total * 100);
        var color = colors2[ci % colors2.length]; ci++;
        h += '<div style="margin-bottom:10px;">';
        h += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span>' + v.icon + ' ' + k + '</span><span style="font-weight:600;">' + (isForeign ? '¥' + Math.round(v.total * cur.rate).toLocaleString() : cur.sym + v.total.toLocaleString()) + ' <span style="font-size:11px;color:var(--muted-fg);font-weight:400;">' + pct + '%</span></span></div>';
        h += '<div style="height:8px;background:var(--muted);border-radius:4px;overflow:hidden;">';
        h += '<div style="height:100%;width:' + Math.max(pct, 2) + '%;background:' + color + ';border-radius:4px;transition:width .5s;"></div></div></div>';
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
      // Group by date
      var byDate = {};
      expenses.forEach(function(e) {
        var d = e.date || '未知日期';
        if (!byDate[d]) byDate[d] = [];
        byDate[d].push(e);
      });
      Object.keys(byDate).sort().reverse().forEach(function(date) {
        var dayExpenses = byDate[date];
        // Find day number from trip
        var dayNum = '';
        if (trip.days instanceof Array) {
          trip.days.forEach(function(d, i) {
            if (d.date === date) dayNum = 'Day ' + (i+1);
          });
        }
        h += '<div style="font-size:11px;color:var(--muted-fg);font-weight:600;padding:8px 0 4px;border-bottom:1px solid var(--border);">' + date + (dayNum ? ' · ' + dayNum : '') + '</div>';
        dayExpenses.forEach(function(e) {
          h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">';
          h += '<span style="font-size:20px;">' + (catDefs[e.cat] || '💰') + '</span>';
          h += '<div style="flex:1;min-width:0;"><div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (e.note || e.cat || '') + '</div>';
          h += '<div style="font-size:11px;color:var(--muted-fg);">' + (e.cat || '') + ' · ' + (e.payer || '我') + '支付</div></div>';
          h += '<span style="font-weight:700;white-space:nowrap;">' + cur.sym + Number(e.amount).toLocaleString() + '</span>';
          h += '<span onclick="removeExpense(\'' + e.id + '\')" style="color:var(--muted-fg);cursor:pointer;padding:4px;">✕</span></div>';
        });
      });
    }
    h += '</div>';
    area.innerHTML = h;
  };

  window.showSplit = function() {
    var area = document.getElementById('listArea');
    if (!area) return;
    var h = '<div class="card"><h3 style="font-size:12px;color:var(--muted-fg);margin-bottom:16px;">AA 分摊</h3>';
    h += '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);"><span>总消费</span><span style="font-weight:700;">' + cur.sym + total.toLocaleString() + '</span></div>';
    h += '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);"><span>人数</span><span style="font-weight:700;">' + (trip.members || 1) + ' 人</span></div>';
    h += '<div style="display:flex;justify-content:space-between;padding:10px 0;"><span>每人应付</span><span style="font-weight:700;color:var(--accent);font-size:18px;">' + cur.sym + Math.round(pp).toLocaleString() + '</span></div></div>';
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
