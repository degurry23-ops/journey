/* Journey — Create Trip (V4 — Card Wizard) */

safeRender(function() {
  var steps = [
    { key:'destination', title:'想去哪里<span class=\"gradient-text\">旅行</span>？', icon:'📍', type:'text', placeholder:'输入目的地，如：日本东京',
      suggests: ['🇯🇵 日本东京','🇨🇳 四川成都','🇨🇳 上海','🇨🇳 北京','🇨🇳 重庆','🇰🇷 韩国首尔','🇹🇭 泰国曼谷','🇨🇳 云南大理'] },
    { key:'startDate', title:'什么时候<span class=\"gradient-text\">出发</span>？', icon:'📅', type:'date', placeholder:'' },
    { key:'days', title:'准备玩<span class=\"gradient-text\">几天</span>？', icon:'📆', type:'chips', chips:['3天','4天','5天','6天','7天','10天'] },
    { key:'members', title:'<span class=\"gradient-text\">几个人</span>一起？', icon:'👥', type:'chips', chips:['1人','2人','3人','4人','5人+'] },
    { key:'budget', title:'每人<span class=\"gradient-text\">预算</span>多少？', icon:'💰', type:'chips', chips:['¥3,000','¥5,000','¥8,000','¥12,000','¥20,000','不限'] },
    { key:'preferences', title:'喜欢什么<span class=\"gradient-text\">旅行风格</span>？', icon:'🎯', type:'styleChips', chips:[
      { icon:'🍜', label:'美食探索' },{ icon:'🏯', label:'文化古迹' },{ icon:'🛍', label:'购物逛街' },{ icon:'🌿', label:'自然风光' },
      { icon:'☕', label:'慢节奏体验' },{ icon:'🏃', label:'特种兵打卡' },{ icon:'📸', label:'拍照圣地' },{ icon:'🎭', label:'当地体验' }
    ]}
  ];

  var step = 0;
  var answers = {};
  var questionArea, previewPanel, previewContent;

  // ── Templates ──
  var templates = [
    { label:'🌸 东京7日', dest:'日本东京', days:'7天', members:'2人', budget:'¥8,000', prefs:'美食探索' },
    { label:'🏔 云南慢旅行', dest:'云南大理', days:'5天', members:'2人', budget:'¥4,000', prefs:'自然风光' },
    { label:'🍜 成都美食', dest:'四川成都', days:'4天', members:'4人', budget:'¥5,000', prefs:'美食探索' },
    { label:'🏙 上海漫步', dest:'上海', days:'3天', members:'1人', budget:'¥3,000', prefs:'慢节奏体验' }
  ];
  var tmplEl = document.getElementById('templates');
  if (tmplEl) {
    tmplEl.innerHTML = templates.map(function(t) {
      return '<span onclick="quickTemplate(\''+t.dest+'\',\''+t.days+'\',\''+t.members+'\',\''+t.budget+'\',\''+t.prefs+'\')" style="padding:10px 18px;border-radius:var(--radius-lg);font-size:14px;background:var(--card);cursor:pointer;transition:all .15s;border:1.5px solid var(--border);">'+t.label+'</span>';
    }).join('');
  }

  window.quickTemplate = function(dest, days, members, budget, prefs) {
    var d = new Date(); d.setDate(d.getDate()+14);
    answers = { destination:dest, startDate:d.toISOString().split('T')[0], days:days, members:members, budget:budget, preferences:prefs };
    startWizard();
    step = steps.length;
    renderStepDots();
    generateTrip();
  };

  // ── Start ──
  window.startWizard = function() {
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('wizard').style.display = 'block';
    questionArea = document.getElementById('questionArea');
    previewPanel = document.getElementById('previewPanel');
    previewContent = document.getElementById('previewContent');
    if (window.innerWidth > 768 && previewPanel) previewPanel.style.display = 'block';
    renderStepDots();
    renderQuestion(0);
    updatePreview();
  };

  // ── Step dots ──
  function renderStepDots() {
    var el = document.getElementById('stepDots');
    if (!el) return;
    var html = '';
    for (var i = 0; i < steps.length; i++) {
      if (i > 0) html += '<div class="step-line' + (i <= step ? ' done' : '') + '"></div>';
      var cls = i < step ? 'done' : i === step ? 'current' : 'next';
      var content = i < step ? '✓' : (i+1);
      html += '<div class="step-dot ' + cls + '">' + content + '</div>';
    }
    el.innerHTML = html;
  }

  // ── Render question card ──
  function renderQuestion(idx) {
    if (!questionArea) return;
    var s = steps[idx];
    var html = '<div class="question-card">';
    html += '<div style="font-size:32px;margin-bottom:8px;">' + s.icon + '</div>';
    html += '<h2>' + s.title + '</h2>';

    if (s.type === 'date') {
      html += '<input type="date" id="wizInput" class="main-input" style="max-width:280px;">';
      html += '<div class="btn-next"><button class="btn btn-primary btn-lg" onclick="wizNext()">下一步 <i class="fas fa-arrow-right"></i></button></div>';

    } else if (s.type === 'chips') {
      html += '<div class="chip-grid">';
      s.chips.forEach(function(c) {
        html += '<span class="chip-btn" onclick="wizPick(\'' + c + '\', this)">' + c + '</span>';
      });
      html += '</div>';

    } else if (s.type === 'styleChips') {
      html += '<div class="chip-grid" style="max-width:440px;margin:0 auto;">';
      s.chips.forEach(function(c) {
        html += '<span class="chip-btn style-chip" onclick="wizPick(\'' + c.label + '\', this)"><span class="style-icon">' + c.icon + '</span>' + c.label + '</span>';
      });
      html += '</div>';

    } else {
      // text
      html += '<input type="text" id="wizInput" class="main-input" placeholder="' + s.placeholder + '" autocomplete="off">';
      if (s.suggests) {
        html += '<div class="suggest-row">';
        s.suggests.forEach(function(sg) {
          html += '<span class="suggest-tag" onclick="wizPickSuggestion(\'' + sg.replace(/^[^ ]+ /, '') + '\')">' + sg + '</span>';
        });
        html += '</div>';
      }
      html += '<div class="btn-next"><button class="btn btn-primary btn-lg" onclick="wizNext()">下一步 <i class="fas fa-arrow-right"></i></button></div>';
    }

    html += '</div>';
    questionArea.innerHTML = html;

    // Focus
    setTimeout(function() {
      var inp = document.getElementById('wizInput');
      if (inp) inp.focus();
    }, 200);
  }

  // ── Actions ──
  window.wizNext = function() {
    var inp = document.getElementById('wizInput');
    var val = inp ? inp.value.trim() : '';
    if (!val) { showToast('请' + steps[step].placeholder.replace('输入',''), 'warning'); return; }
    answers[steps[step].key] = val;
    advance();
  };

  window.wizPick = function(val, el) {
    // Highlight
    var cards = questionArea.querySelectorAll('.chip-btn');
    cards.forEach(function(c) { c.classList.remove('selected'); });
    el.classList.add('selected');
    answers[steps[step].key] = val;
    setTimeout(function() { advance(); }, 250);
  };

  window.wizPickSuggestion = function(val) {
    var inp = document.getElementById('wizInput');
    if (inp) inp.value = val;
    answers[steps[step].key] = val;
    advance();
  };

  function advance() {
    updatePreview();
    step++;
    renderStepDots();
    if (step < steps.length) {
      renderQuestion(step);
    } else {
      generateTrip();
    }
  }

  // ── Live preview ──
  function updatePreview() {
    if (!previewContent) return;
    var items = [];
    if (answers.destination) items.push('<div><span style="font-weight:600;">📍</span> ' + answers.destination + '</div>');
    if (answers.startDate) items.push('<div><span style="font-weight:600;">📅</span> ' + answers.startDate + ' 出发</div>');
    if (answers.days) items.push('<div><span style="font-weight:600;">📆</span> ' + answers.days + '</div>');
    if (answers.members) items.push('<div><span style="font-weight:600;">👥</span> ' + answers.members + '</div>');
    if (answers.budget) items.push('<div><span style="font-weight:600;">💰</span> 每人 ' + answers.budget + '</div>');
    if (answers.preferences) items.push('<div><span style="font-weight:600;">🎯</span> ' + answers.preferences + '</div>');
    if (items.length === 0) items.push('<div style="color:var(--muted-fg);font-style:italic;">选择参数后实时预览...</div>');
    previewContent.innerHTML = items.join('');
  }

  // ── AI Generation ──
  async function generateTrip() {
    questionArea.innerHTML = '<div class="question-card">' +
      '<div style="font-size:48px;margin-bottom:16px;">✨</div>' +
      '<h2>正在生成你的旅行...</h2>' +
      '<div id="genProgress" style="text-align:left;max-width:300px;margin:20px auto 0;"></div></div>';

    var progSteps = ['分析最佳旅行时间...','筛选热门地点...','计算路线距离...','生成每日安排...','准备预算方案...'];
    var progEl = document.getElementById('genProgress');
    for (var i = 0; i < progSteps.length; i++) {
      await new Promise(function(r) { setTimeout(r, 400); });
      if (progEl) {
        progEl.innerHTML = progSteps.slice(0, i+1).map(function(s) {
          return '<div style="font-size:13px;color:var(--success);margin-top:6px;">✓ ' + s + '</div>';
        }).join('');
      }
    }

    var numDays = parseInt(answers.days || 5);
    var numMembers = parseInt(answers.members || 1);
    var numBudget = parseInt(answers.budget || 5000);
    var startDate = answers.startDate || new Date().toISOString().split('T')[0];
    var endDate = new Date(startDate);
    if (isNaN(endDate.getTime())) endDate = new Date();
    endDate.setDate(endDate.getDate() + numDays - 1);
    var tripDays = null;

    try {
      var aiResult = await callAITripPlan({ destination:answers.destination, startDate:startDate, numDays:numDays, members:numMembers, budget:numBudget, preferences:answers.preferences||'' });
      if (aiResult && aiResult.days && aiResult.days.length) {
        tripDays = aiResult.days.map(function(d, i) {
          return { id:'g'+Date.now()+'-'+i, date:d.date||startDate, weather:d.weather||'☀️ 晴', tip:d.tip||'', places:(d.places||[]).map(function(p) {
            return { id:'gp'+Date.now()+'-'+Math.random().toString(36).slice(2,7), name:p.name, cat:p.category||p.cat||'景点', time:p.time||'09:00', duration:p.duration||'1h', fee:p.fee||'免费', lat:p.lat||null, lng:p.lng||null };
          })};
        });
      }
    } catch(e) {}

    if (!tripDays || !tripDays.length) {
      var plan = generateTripPlan(answers.destination, startDate, numDays, numMembers, numBudget, answers.preferences);
      tripDays = (plan && plan.days) ? plan.days : [];
    }

    if (!tripDays || !tripDays.length) {
      questionArea.innerHTML = '<div class="question-card"><div style="font-size:32px;margin-bottom:8px;">😞</div><h2>生成失败</h2><p style="color:var(--muted-fg);">请重试或换个目的地</p><button class="btn btn-primary" style="margin-top:16px;" onclick="location.reload()">重新开始</button></div>';
      return;
    }

    window._tripData = { name:(answers.destination||'未知')+'之旅', destination:answers.destination||'', startDate:startDate, endDate:endDate.toISOString().split('T')[0], members:numMembers, days:tripDays, budget:numBudget, emoji:'🌏', readiness:30 };

    // Hide step dots
    var dotsEl = document.getElementById('stepDots');
    if (dotsEl) dotsEl.style.display = 'none';

    var totalPlaces = tripDays.reduce(function(s,d){ return s+(d.places?d.places.length:0); },0);
    var dest = answers.destination||'';
    var emojiMap = {'日本':'🇯🇵','东京':'🇯🇵','成都':'🐼','上海':'🌆','大理':'🏔️','北京':'🏯','重庆':'🌶','首尔':'🇰🇷','曼谷':'🇹🇭'};
    var emoji = '🌏';
    Object.keys(emojiMap).forEach(function(k){ if(dest.indexOf(k)>=0) emoji=emojiMap[k]; });

    var html = '';

    // ── Hero overview card ──
    html += '<div style="background:linear-gradient(135deg,var(--fg),#1E3A5F);color:#fff;border-radius:var(--radius-xl);padding:36px 32px;margin-bottom:24px;position:relative;overflow:hidden;">';
    html += '<div style="position:absolute;top:-30%;right:-10%;width:200px;height:200px;background:radial-gradient(circle,rgba(0,130,255,.25),transparent 70%);border-radius:50%;pointer-events:none;"></div>';
    html += '<div style="position:relative;z-index:1;">';
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">';
    html += '<span style="font-size:44px;">'+emoji+'</span>';
    html += '<div><h2 style="font-family:var(--font-display);font-size:1.8rem;line-height:1.2;">'+(dest||'')+'<span style="opacity:.7;"> · '+numDays+'日探索</span></h2>';
    html += '<p style="opacity:.6;font-size:13px;margin-top:4px;">'+startDate+' 出发 · '+numDays+'天 · '+numMembers+'人同行</p></div></div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;">';
    html += '<div style="background:rgba(255,255,255,.1);border-radius:var(--radius);padding:12px 14px;"><div style="font-size:11px;opacity:.6;">📍 地点</div><div style="font-weight:700;font-size:1.1rem;">'+totalPlaces+'个</div></div>';
    html += '<div style="background:rgba(255,255,255,.1);border-radius:var(--radius);padding:12px 14px;"><div style="font-size:11px;opacity:.6;">💰 预算</div><div style="font-weight:700;font-size:1.1rem;">每人¥'+(numBudget||0).toLocaleString()+'</div></div>';
    html += '<div style="background:rgba(255,255,255,.1);border-radius:var(--radius);padding:12px 14px;"><div style="font-size:11px;opacity:.6;">🎯 风格</div><div style="font-weight:700;font-size:1.1rem;">'+(answers.preferences||'综合体验')+'</div></div>';
    html += '<div style="background:rgba(255,255,255,.1);border-radius:var(--radius);padding:12px 14px;"><div style="font-size:11px;opacity:.6;">✨ AI推荐</div><div style="font-weight:700;font-size:1.1rem;color:#FBBF24;">★★★★★</div></div>';
    html += '</div></div></div>';

    // ── AI explanation ──
    html += '<div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,#F8FAFF,#FFF);border:1px solid rgba(0,82,255,.08);">';
    html += '<div style="display:flex;gap:10px;align-items:flex-start;">';
    html += '<span style="font-size:18px;">🤖</span>';
    html += '<div><div style="font-weight:600;font-size:13px;margin-bottom:4px;">AI 规划说明</div>';
    html += '<p style="font-size:12px;color:var(--muted-fg);line-height:1.6;">根据你选择的<strong>'+(answers.preferences||'综合体验')+'</strong>偏好，AI 优先安排了'+(answers.preferences&&answers.preferences.indexOf('美食')>=0?'美食体验':'经典景点')+'路线。每天安排 '+(totalPlaces/numDays).toFixed(1)+' 个地点，预留充足探索时间。建议第一天轻松出发，逐渐深入城市。</p>';
    html += '</div></div></div>';

    // ── Day cards (left) + Summary (right) layout ──
    html += '<div class="result-layout">';
    // Left: day cards
    html += '<div>';
    tripDays.forEach(function(day, d) {
      var dayNames = ['城市初探','深度探索','文化漫游','自然之旅','美食寻访','悠闲时光','完美收官'];
      html += '<div class="card animate-in" style="margin-bottom:10px;">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">';
      html += '<div style="display:flex;align-items:center;gap:8px;"><span class="tag tag-blue">Day '+(d+1)+'</span><span style="font-size:14px;font-weight:600;">'+(dayNames[d]||'探索日')+'</span></div>';
      html += '<span style="font-size:12px;color:var(--muted-fg);">'+(day.weather||'☀️')+'</span></div>';
      if (day.tip) html += '<p style="font-size:11px;color:var(--accent);margin-bottom:8px;">💡 '+day.tip+'</p>';
      (day.places||[]).forEach(function(pl) {
        var ci = pl.cat==='美食'?'🍜':pl.cat==='咖啡'?'☕':pl.cat==='购物'?'🛍':pl.cat==='住宿'?'🏨':pl.cat==='交通'?'🚇':'📍';
        html += '<div style="display:flex;align-items:center;gap:10px;padding:5px 0;font-size:14px;border-bottom:1px solid var(--border);">';
        html += '<span style="font-family:var(--font-mono);font-size:11px;color:var(--muted-fg);min-width:44px;">'+(pl.time||'09:00')+'</span>';
        html += '<span style="font-size:16px;">'+ci+'</span>';
        html += '<span style="flex:1;">'+pl.name+'</span>';
        html += '<span style="font-size:11px;color:var(--muted-fg);">'+(pl.duration||'1h')+'</span></div>';
      });
      html += '</div>';
    });
    html += '</div>';

    // Right: trip summary panel
    html += '<div style="position:sticky;top:80px;">';
    html += '<div class="card" style="margin-bottom:12px;">';
    html += '<h3 style="font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted-fg);margin-bottom:12px;">📋 旅行概览</h3>';
    html += '<div style="font-size:13px;line-height:2;color:var(--muted-fg);">';
    html += '<div>📍 '+(dest||'')+'</div>';
    html += '<div>📅 '+startDate+' — '+endDate.toISOString().split('T')[0]+'</div>';
    html += '<div>📆 '+numDays+'天 · '+numMembers+'人</div>';
    html += '<div>💰 每人 ¥'+(numBudget||0).toLocaleString()+'</div>';
    html += '<div>🎯 '+(answers.preferences||'综合体验')+'</div>';
    html += '<div>📍 '+totalPlaces+'个地点</div>';
    html += '</div></div>';

    // Quick stats
    html += '<div class="card" style="margin-bottom:12px;">';
    html += '<h3 style="font-family:var(--font-mono);font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted-fg);margin-bottom:12px;">✨ AI 指数</h3>';
    html += '<div style="font-size:13px;color:var(--muted-fg);">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>路线合理度</span><span style="color:#F59E0B;">★★★★★</span></div>';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>时间安排</span><span style="color:#F59E0B;">★★★★☆</span></div>';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>预算匹配</span><span style="color:#F59E0B;">★★★★☆</span></div>';
    html += '</div></div>';

    // Buttons in sidebar
    html += '<button class="btn btn-primary btn-full btn-lg" style="margin-bottom:8px;" onclick="confirmTrip()">✈️ 保存并开始旅程</button>';
    html += '<button class="btn btn-outline btn-full" style="margin-bottom:8px;" onclick="location.reload()">🔄 重新生成</button>';
    html += '<a href="create.html" class="btn btn-outline btn-full btn-sm" style="color:var(--muted-fg);">← 修改偏好</a>';
    html += '</div></div>';

    questionArea.innerHTML = html;
    if (previewPanel) previewPanel.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.confirmTrip = function() {
    if (!window._tripData) return;
    var t = addTrip(window._tripData);
    location.href = 'trip-detail.html?id=' + t.id;
  };

  // Keyboard
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.getElementById('wizard') && document.getElementById('wizard').style.display !== 'none') {
      var inp = document.getElementById('wizInput');
      if (inp && document.activeElement === inp) { e.preventDefault(); wizNext(); }
    }
  });
});
