/* Journey — Expenses Page (V3 — Multi-Currency + Settlement) */

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
  // Normalize: ensure each expense has currency fields
  expenses.forEach(function(e) {
    if (!e.currency) e.currency = (typeof getCurrency === 'function' ? getCurrency(trip.destination).code : 'CNY');
    if (!e.settlementAmount) e.settlementAmount = Math.round(e.amount * (typeof getCurrency === 'function' ? getCurrency(trip.destination).rate : 1));
    if (!e.participants) e.participants = [];
    if (e.amountCNY == null) e.amountCNY = Math.round(e.amount * (typeof getCurrency === 'function' ? getCurrency(trip.destination).rate : 1));
  });

  saveTrips(loadTrips().map(function(t) { return t.id === trip.id ? trip : t; }));

  var members = trip.memberNames || [];
  if (members.length === 0) {
    members.push('我');
    for (var m = 1; m < (trip.members || 1); m++) members.push('成员' + (m + 1));
  }

  // Detect if trip is foreign by checking expense currencies in the DATA
  var foreignCurrencies = ['JPY','KRW','THB','USD','EUR'];
  var hasForeignExpense = expenses.some(function(e) { return e.currency && foreignCurrencies.indexOf(e.currency) >= 0; });
  var cur = typeof getCurrency === 'function' ? getCurrency(trip.destination) : { sym: '¥', code: 'CNY', rate: 1 };
  if (hasForeignExpense && cur.code === 'CNY') {
    // If expenses are foreign but getCurrency didn't detect it, use the expense currency
    var foreignExp = expenses.find(function(e) { return e.currency && foreignCurrencies.indexOf(e.currency) >= 0; });
    if (foreignExp) cur = (typeof getCurrency === 'function' ? getCurrency(trip.destination) : null) || { sym: '¥', code: foreignExp.currency, rate: 0.05 };
  }
  var isForeign = hasForeignExpense;

  // Calculate totals in CNY for budget comparison
  var totalCNY = expenses.reduce(function(s, e) { return s + (e.amountCNY || Math.round(e.amount * cur.rate)); }, 0);
  var budgetPerPerson = parseInt(trip.budget) || 0;
  var budgetTotal = budgetPerPerson * (trip.members || 1);
  var budgetUsed = budgetTotal > 0 ? Math.round(totalCNY / budgetTotal * 100) : 0;

  var catDefs = { '餐饮': '🍜', '交通': '🚇', '住宿': '🏨', '门票': '🎫', '购物': '🛍', '其他': '💊' };
  var catColors = ['#0052FF','#10B981','#F59E0B','#8B5CF6','#EF4444','#EC4899'];

  var currentTab = 'overview'; // overview | detail | settle

  function render() {
    var h = '';

    // ── Tab switcher ──
    h += '<div style="display:flex;gap:4px;background:var(--muted);border-radius:999px;padding:3px;margin-bottom:20px;">';
    ['overview','detail','settle'].forEach(function(tab) {
      var labels = { overview: '总览', detail: '明细', settle: '👥 结算' };
      h += '<button class="btn btn-sm" style="flex:1;border-radius:999px;' + (tab === currentTab ? 'background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05);' : 'color:var(--muted-fg);') + '" onclick="switchTab(\'' + tab + '\')">' + labels[tab] + '</button>';
    });
    h += '</div>';

    if (currentTab === 'overview') h += renderOverview();
    else if (currentTab === 'detail') h += renderDetail();
    else h += renderSettle();

    document.getElementById('content').innerHTML = h;
  }

  // ── Overview Tab ──
  function renderOverview() {
    var h = '';
    // Hero card
    h += '<div style="background:var(--fg);color:#fff;border-radius:16px;padding:24px;margin-bottom:16px;">';
    h += '<div style="font-size:13px;opacity:.7;">💰 本次旅行花费</div>';
    if (isForeign) {
      h += '<div style="font-size:2.2rem;font-weight:700;margin:4px 0;">¥' + totalCNY.toLocaleString() + ' <span style="font-size:14px;opacity:.7;">CNY</span></div>';
      h += '<div style="font-size:14px;opacity:.5;margin-bottom:4px;">≈ ' + cur.sym + expenses.reduce(function(s,e){return s+e.amount;},0).toLocaleString() + ' ' + cur.code + '</div>';
    } else {
      var totalLocal = expenses.reduce(function(s,e){return s+e.amount;},0);
      h += '<div style="font-size:2.5rem;font-weight:700;margin:4px 0;">' + cur.sym + totalLocal.toLocaleString() + ' <span style="font-size:14px;opacity:.7;">CNY</span></div>';
    }
    h += '<div style="display:flex;gap:16px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.1);">';
    h += '<div><span style="font-size:11px;opacity:.5;">人均</span><div style="font-weight:700;">¥' + Math.round(totalCNY/(trip.members||1)).toLocaleString() + '</div></div>';
    h += '<div><span style="font-size:11px;opacity:.5;">笔数</span><div style="font-weight:700;">' + expenses.length + '</div></div>';
    if (isForeign) h += '<div><span style="font-size:11px;opacity:.5;">汇率</span><div style="font-weight:700;font-size:13px;">1 ' + cur.code + ' ≈ ' + cur.rate + ' CNY</div></div>';
    h += '</div>';
    // Budget
    if (budgetTotal > 0) {
      var alertColor = budgetUsed >= 100 ? '#EF4444' : budgetUsed >= 80 ? '#F59E0B' : '#10B981';
      h += '<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.1);">';
      h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;opacity:.7;">预算剩余</span><span style="font-size:13px;font-weight:600;color:' + alertColor + ';">¥' + Math.max(0, budgetTotal - totalCNY).toLocaleString() + '</span></div>';
      h += '<div style="height:6px;background:rgba(255,255,255,.15);border-radius:3px;overflow:hidden;">';
      h += '<div style="height:100%;width:' + Math.min(budgetUsed,100) + '%;background:#fff;border-radius:3px;"></div></div>';
      h += '<div style="font-size:11px;opacity:.5;margin-top:4px;">总预算 ¥' + budgetTotal.toLocaleString() + ' · 已用 ' + budgetUsed + '%</div></div>';
    }
    h += '</div>';

    // Category breakdown
    var cats = {};
    expenses.forEach(function(e) {
      var c = e.cat || e.category || '其他';
      if (!cats[c]) cats[c] = 0;
      cats[c] += (e.amountCNY || e.amount);
    });
    if (Object.keys(cats).length) {
      h += '<div class="card" style="margin-bottom:16px;"><h3 style="font-size:12px;color:var(--muted-fg);margin-bottom:12px;">消费结构</h3>';
      var sorted = Object.entries(cats).sort(function(a,b){return b[1]-a[1];});
      sorted.forEach(function(entry, i) {
        var k = entry[0], v = entry[1];
        var pct = Math.round(v/totalCNY*100);
        h += '<div style="margin-bottom:10px;">';
        h += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span>' + (catDefs[k]||'💰') + ' ' + k + '</span><span style="font-weight:600;">¥' + v.toLocaleString() + ' <span style="font-size:11px;color:var(--muted-fg);font-weight:400;">' + pct + '%</span></span></div>';
        h += '<div style="height:8px;background:var(--muted);border-radius:4px;overflow:hidden;">';
        h += '<div style="height:100%;width:' + Math.max(pct,2) + '%;background:' + (catColors[i%catColors.length]) + ';border-radius:4px;"></div></div></div>';
      });
      h += '</div>';
    }

    // Payer ranking
    var payers = {};
    expenses.forEach(function(e) {
      var p = e.payer || '我';
      if (!payers[p]) payers[p] = 0;
      payers[p] += (e.amountCNY || e.amount);
    });
    if (Object.keys(payers).length > 1) {
      h += '<div class="card" style="margin-bottom:16px;"><h3 style="font-size:12px;color:var(--muted-fg);margin-bottom:12px;">👥 支付排行</h3>';
      Object.entries(payers).sort(function(a,b){return b[1]-a[1];}).forEach(function(entry) {
        var k = entry[0], v = entry[1];
        var pct = Math.round(v/totalCNY*100);
        h += '<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px;"><span>' + k + '</span><span style="font-weight:600;">¥' + v.toLocaleString() + '</span></div>';
        h += '<div style="height:6px;background:var(--muted);border-radius:3px;overflow:hidden;"><div style="height:100%;width:' + pct + '%;background:var(--accent);border-radius:3px;"></div></div></div>';
      });
      h += '</div>';
    }

    // AI analysis
    if (expenses.length) {
      var topCat = sorted ? sorted[0] : ['其他', 0];
      var topPct = Math.round(topCat[1]/totalCNY*100);
      h += '<div class="card" style="margin-bottom:16px;background:linear-gradient(135deg,#F8FAFF,#FFF);border:1px solid rgba(0,82,255,.08);">';
      h += '<div style="display:flex;gap:10px;align-items:flex-start;"><span style="font-size:18px;">🤖</span><div>';
      h += '<div style="font-weight:600;font-size:13px;margin-bottom:4px;">AI 消费分析</div>';
      h += '<p style="font-size:12px;color:var(--muted-fg);line-height:1.6;">' + (topPct>50?topCat[0]+'占'+topPct+'%，':'' ) + '你的旅程偏向' + (topCat[0]==='门票'?'体验型':topCat[0]==='餐饮'?'美食型':'均衡型') + '消费。';
      if (budgetUsed>80) h += '预算已用'+budgetUsed+'%，建议控制后续支出。';
      else h += '预算使用正常。';
      h += '</p></div></div></div>';
    }

    return h;
  }

  // ── Detail Tab ──
  function renderDetail() {
    var h = '';
    if (!expenses.length) {
      h += '<div class="empty-state"><i class="fas fa-receipt"></i><h3>暂无消费记录</h3><p>点击右下角 + 添加第一笔</p></div>';
    } else {
      var byDate = {};
      expenses.forEach(function(e) {
        var d = e.date || '未知';
        if (!byDate[d]) byDate[d] = [];
        byDate[d].push(e);
      });
      Object.keys(byDate).sort().reverse().forEach(function(date) {
        var dayNum = '';
        if (trip.days instanceof Array) {
          trip.days.forEach(function(d,i) { if (d.date===date) dayNum = 'Day '+(i+1); });
        }
        h += '<div class="card" style="margin-bottom:10px;">';
        h += '<div style="font-size:11px;color:var(--muted-fg);font-weight:600;margin-bottom:8px;">' + date + (dayNum?' · '+dayNum:'') + '</div>';
        byDate[date].forEach(function(e) {
          var catIcon = catDefs[e.cat||e.category] || '💰';
          var amountCNY = e.amountCNY || Math.round(e.amount * cur.rate);
          h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">';
          h += '<span style="font-size:20px;">' + catIcon + '</span>';
          h += '<div style="flex:1;min-width:0;">';
          h += '<div style="font-weight:600;font-size:14px;">' + (e.note || e.cat || '') + '</div>';
          h += '<div style="font-size:11px;color:var(--muted-fg);">' + (e.payer||'我') + '支付';
          if (e.participants && e.participants.length > 0) h += ' · ' + e.participants.join('、');
          h += '</div></div>';
          h += '<div style="text-align:right;">';
          h += '<div style="font-weight:700;">' + cur.sym + e.amount.toLocaleString() + '</div>';
          if (isForeign) h += '<div style="font-size:11px;color:var(--muted-fg);">≈ ¥' + amountCNY.toLocaleString() + '</div>';
          h += '</div>';
          h += '<span onclick="removeExpense(\''+e.id+'\')" style="color:var(--muted-fg);cursor:pointer;padding:4px;">✕</span></div>';
        });
        h += '</div>';
      });
    }
    return h;
  }

  // ── Settlement Tab ──
  function renderSettle() {
    var h = '';
    if (!expenses.length) {
      h += '<div class="empty-state"><i class="fas fa-calculator"></i><h3>暂无消费记录</h3><p>添加消费后自动计算结算方案</p></div>';
      return h;
    }

    // Calculate per-person totals
    var personPaid = {}; // how much each person paid
    var personOwes = {}; // how much each person should pay (based on participants)
    members.forEach(function(m) { personPaid[m] = 0; personOwes[m] = 0; });

    expenses.forEach(function(e) {
      var payer = e.payer || '我';
      var amtCNY = e.amountCNY || Math.round(e.amount * cur.rate);
      personPaid[payer] = (personPaid[payer] || 0) + amtCNY;

      var participants = (e.participants && e.participants.length > 0) ? e.participants : members;
      var sharePerPerson = Math.round(amtCNY / participants.length);
      participants.forEach(function(p) {
        personOwes[p] = (personOwes[p] || 0) + sharePerPerson;
      });
    });

    // Calculate net balances
    var balances = [];
    members.forEach(function(m) {
      var paid = personPaid[m] || 0;
      var owes = personOwes[m] || 0;
      balances.push({ name: m, paid: paid, owes: owes, net: paid - owes });
    });

    // Calculate transfers
    var creditors = balances.filter(function(b) { return b.net > 0; }).sort(function(a,b){return b.net-a.net;});
    var debtors = balances.filter(function(b) { return b.net < 0; }).sort(function(a,b){return a.net-b.net;});
    var transfers = [];
    var ci = 0, di = 0;
    while (ci < creditors.length && di < debtors.length) {
      var amount = Math.min(creditors[ci].net, -debtors[di].net);
      if (amount >= 1) {
        transfers.push({ from: debtors[di].name, to: creditors[ci].name, amount: amount });
      }
      creditors[ci].net -= amount;
      debtors[di].net += amount;
      if (creditors[ci].net < 1) ci++;
      if (debtors[di].net > -1) di++;
    }

    // Render member cards
    h += '<div class="card" style="margin-bottom:16px;"><h3 style="font-size:12px;color:var(--muted-fg);margin-bottom:12px;">👥 成员账单</h3>';
    balances.forEach(function(b) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">';
      h += '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:600;">' + b.name[0] + '</div>';
      h += '<div style="flex:1;"><div style="font-weight:600;font-size:14px;">' + b.name + '</div><div style="font-size:11px;color:var(--muted-fg);">已支付 ¥' + b.paid.toLocaleString() + ' · 应支付 ¥' + b.owes.toLocaleString() + '</div></div>';
      h += '<div style="text-align:right;font-weight:700;font-size:14px;color:' + (b.net>=0?'var(--success)':'var(--danger)') + ';">' + (b.net>=0?'+':'') + '¥' + b.net.toLocaleString() + '</div></div>';
    });
    h += '</div>';

    // Transfer suggestions
    if (transfers.length > 0) {
      h += '<div class="card" style="margin-bottom:16px;background:linear-gradient(135deg,#F0FDF4,#FFF);border:1px solid rgba(16,185,129,.15);">';
      h += '<h3 style="font-size:12px;color:var(--muted-fg);margin-bottom:12px;">💸 转账建议</h3>';
      transfers.forEach(function(t) {
        h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">';
        h += '<span style="font-size:20px;">' + t.from[0] + '→' + t.to[0] + '</span>';
        h += '<div style="flex:1;font-size:14px;">' + t.from + ' <span style="color:var(--muted-fg);">转给</span> ' + t.to + '</div>';
        h += '<span style="font-weight:700;font-size:16px;color:var(--accent);">¥' + t.amount.toLocaleString() + '</span></div>';
      });
      h += '<div style="text-align:center;font-size:12px;color:var(--success);margin-top:8px;">✓ 全部平账</div>';
      h += '</div>';
    } else {
      h += '<div class="card" style="margin-bottom:16px;text-align:center;padding:20px;color:var(--success);">✓ 已全部平账，无需转账</div>';
    }

    // AI summary
    if (transfers.length > 0) {
      h += '<div class="card" style="background:linear-gradient(135deg,#F8FAFF,#FFF);border:1px solid rgba(0,82,255,.08);"><div style="display:flex;gap:10px;align-items:flex-start;"><span style="font-size:18px;">🤖</span><div>';
      h += '<div style="font-weight:600;font-size:13px;margin-bottom:4px;">AI 结算总结</div>';
      h += '<p style="font-size:12px;color:var(--muted-fg);line-height:1.6;">共 ' + expenses.length + ' 笔消费，总花费 ¥' + totalCNY.toLocaleString() + '。';
      var topPayer = balances.sort(function(a,b){return b.paid-a.paid;})[0];
      h += topPayer.name + ' 支付最多（¥' + topPayer.paid.toLocaleString() + '）。';
      h += '共需 ' + transfers.length + ' 笔转账即可平账。</p></div></div></div>';
    }

    return h;
  }

  // ── Tab switch ──
  window.switchTab = function(tab) {
    currentTab = tab;
    render();
  };

  // ── Add expense sheet ──
  window.addExpense = function() {
    var aEl = document.getElementById('expAmt');
    var cEl = document.getElementById('expCat');
    var nEl = document.getElementById('expNote');
    var pEl = document.getElementById('expPayer');
    var a = aEl ? aEl.value : '';
    var c = cEl ? cEl.value : '餐饮';
    var n = nEl ? nEl.value : '';
    var p = pEl ? pEl.value : '我';
    if (!a || parseFloat(a) <= 0) { showToast('请输入有效金额', 'warning'); return; }

    var amount = parseFloat(a);
    var rate = cur.rate;
    trip.expenses.push({
      id: 'e-' + Date.now(),
      amount: amount, currency: cur.code,
      amountCNY: Math.round(amount * rate),
      cat: c, note: n, payer: p,
      participants: members.slice(),
      date: new Date().toISOString().split('T')[0]
    });

    saveTrips(loadTrips().map(function(t) { return t.id === trip.id ? trip : t; }));
    showToast('已记录', 'success');
    setTimeout(function() { location.reload(); }, 400);
  };

  window.removeExpense = function(id) {
    showConfirm('确定删除这笔记录吗？', function() {
      trip.expenses = trip.expenses.filter(function(e) { return e.id !== id; });
      saveTrips(loadTrips().map(function(t) { return t.id === trip.id ? trip : t; }));
      location.reload();
    });
  };

  // ── Add button ──
  document.addEventListener('click', function(e) {
    if (e.target.id === 'addBtn') {
      var h = '<div class="sheet" style="max-height:80vh;overflow-y:auto;"><div class="sheet-handle"></div>';
      h += '<h4 style="font-weight:600;margin-bottom:12px;text-align:center;">添加消费</h4>';
      h += '<input class="input" id="expAmt" type="number" placeholder="金额 (' + cur.sym + ')" style="margin-bottom:8px;font-size:20px;font-weight:700;" autofocus>';
      if (isForeign) h += '<div style="font-size:12px;color:var(--muted-fg);margin-bottom:8px;">当地货币 · 自动换算 CNY</div>';
      h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">';
      Object.keys(catDefs).forEach(function(c) {
        h += '<span onclick="var t=event.target;t.style.background=\'var(--accent)\';t.style.color=\'#fff\';document.getElementById(\'expCat\').value=\''+c+'\'" style="padding:6px 12px;border-radius:999px;font-size:12px;background:var(--muted);cursor:pointer;">'+catDefs[c]+' '+c+'</span>';
      });
      h += '</div><input type="hidden" id="expCat" value="餐饮">';
      h += '<input class="input" id="expNote" placeholder="备注（如：迪士尼门票）" style="margin-bottom:8px;">';
      h += '<div style="display:flex;gap:6px;margin-bottom:8px;"><span style="font-size:13px;color:var(--muted-fg);padding:6px 0;">支付人：</span>';
      h += '<select id="expPayer" style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:var(--radius);font-size:13px;background:var(--card);">';
      members.forEach(function(m) { h += '<option>' + m + '</option>'; });
      h += '</select></div>';
      h += '<div style="display:flex;gap:8px;margin-top:12px;"><button onclick="this.parentElement.parentElement.remove()" class="btn btn-outline btn-full">取消</button><button onclick="addExpense()" class="btn btn-primary btn-full">记录</button></div></div>';
      var content = document.getElementById('content');
      if (content) content.insertAdjacentHTML('beforeend', h);
    }
  });

  render();
});
