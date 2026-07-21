/* Journey — Create Trip Page (AI Chat + Onboarding) */

safeRender(function() {
  // ── Templates ──
  var templates = [
    { label: '🌸 东京7日漫游', destination: '日本东京', days: 7, members: 2, budget: 8000, preferences: '美食探索', emoji: '🇯🇵' },
    { label: '🏔 云南慢旅行', destination: '云南大理', days: 5, members: 2, budget: 4000, preferences: '自然风光', emoji: '🏔️' },
    { label: '🍜 成都美食之旅', destination: '四川成都', days: 4, members: 4, budget: 5000, preferences: '美食探索', emoji: '🐼' },
    { label: '🏙 上海都市漫游', destination: '上海', days: 3, members: 1, budget: 3000, preferences: '慢节奏体验', emoji: '🌆' }
  ];

  var tmplContainer = document.getElementById('templates');
  if (tmplContainer) {
    tmplContainer.innerHTML = templates.map(function(t) {
      return '<span onclick="quickTemplate(\'' + t.destination + '\',' + t.days + ',' + t.members + ',' + t.budget + ',\'' + t.preferences + '\')" style="padding:10px 18px;border-radius:var(--radius-lg);font-size:14px;background:var(--card);color:var(--fg);cursor:pointer;transition:all .15s;border:1.5px solid var(--border);white-space:nowrap;">' + t.label + '</span>';
    }).join('');
  }

  window.quickTemplate = function(dest, days, members, budget, prefs) {
    startChat();
    // Default start date to 2 weeks from now
    var d = new Date();
    d.setDate(d.getDate() + 14);
    var defaultDate = d.toISOString().split('T')[0];
    answers = { destination: dest, startDate: defaultDate, days: '' + days, members: '' + members, budget: '' + budget, preferences: prefs };
    step = steps.length - 1;
    addChat(dest + ' · ' + days + '天 · ' + members + '人 · ' + defaultDate, 'user');
    generateTrip();
  };

  window.startChat = function() {
    var ob = document.getElementById('onboarding');
    var cp = document.getElementById('chatPhase');
    if (ob) ob.style.display = 'none';
    if (cp) { cp.style.display = 'flex'; cp.style.flexDirection = 'column'; }
    var firstS = steps[0];
    updateInput();
    if (firstS.suggestions) {
      addChat(firstS.q, 'ai', { suggestions: firstS.suggestions });
    }
  };

  var steps = [
    { q: 'Hi！想去哪里<span class=\"gradient-text\" style=\"font-weight:600;\">旅行</span>？', icon: '🌏', hint: '输入目的地或点击下方推荐', key: 'destination', placeholder: '例如：日本东京', suggestions: [
      { label: '🇯🇵 日本东京', value: '日本东京' },
      { label: '🇨🇳 四川成都', value: '四川成都' },
      { label: '🇨🇳 上海', value: '上海' },
      { label: '🇨🇳 北京', value: '北京' },
      { label: '🇨🇳 重庆', value: '重庆' },
      { label: '🇰🇷 韩国首尔', value: '韩国首尔' },
      { label: '🇹🇭 泰国曼谷', value: '泰国曼谷' },
      { label: '🇨🇳 云南大理', value: '云南大理' }
    ]},
    { q: '什么时候出发？', icon: '📅', hint: '选择出发日期', key: 'startDate', placeholder: '选择日期', type: 'date' },
    { q: '准备玩几天？', icon: '📆', hint: '点击选择天数', key: 'days', placeholder: '', type: 'chips', chips: ['3天','4天','5天','6天','7天','10天'] },
    { q: '几个人一起？', icon: '👥', hint: '算上你自己哦', key: 'members', placeholder: '', type: 'chips', chips: ['1人','2人','3人','4人','5人+'] },
    { q: '每人预算大概多少？', icon: '💰', hint: '点击选择预算档位', key: 'budget', placeholder: '', type: 'chips', chips: ['¥3,000','¥5,000','¥8,000','¥12,000','¥20,000','不限'] },
    { q: '这次旅行更偏向什么风格？', icon: '🎯', hint: '选择一个风格，AI 帮你定制', key: 'preferences', placeholder: '', type: 'styleChips', chips: [
      { icon: '🍜', label: '美食探索' },
      { icon: '🏯', label: '文化古迹' },
      { icon: '🛍', label: '购物逛街' },
      { icon: '🌿', label: '自然风光' },
      { icon: '☕', label: '慢节奏体验' },
      { icon: '🏃', label: '特种兵打卡' },
      { icon: '📸', label: '拍照圣地' },
      { icon: '🎭', label: '当地体验' }
    ]}
  ];

  var step = 0;
  var answers = {};

  var chat = document.getElementById('chat');
  var answer = document.getElementById('answer');
  var sendBtn = document.getElementById('sendBtn');
  var progress = document.getElementById('progress');
  var stepIcon = document.getElementById('stepIcon');
  var stepHint = document.getElementById('stepHint');

  if (!chat || !answer || !sendBtn) {
    document.body.innerHTML = '<div class="empty-state" style="padding-top:100px;"><i class="fas fa-exclamation-triangle"></i><h3>页面加载异常</h3><a href="index.html" class="btn btn-primary">返回首页</a></div>';
    return;
  }

  function updateInput() {
    var s = steps[step];
    var isChipStep = s.type === 'chips' || s.type === 'styleChips';
    answer.type = isChipStep ? 'text' : (s.type || 'text');
    answer.placeholder = isChipStep ? '点击上方选项，或直接输入' : s.placeholder;
    answer.style.display = '';
    sendBtn.style.display = '';
    if (stepIcon) stepIcon.style.display = '';
    if (stepHint) stepHint.textContent = '第 ' + (step + 1) + '/' + steps.length + ' 步' + (isChipStep ? ' · 点击选项或输入后回车' : ' · 按 Enter 发送');
    if (stepIcon) stepIcon.textContent = s.icon;
    if (progress) progress.style.width = (step / steps.length * 100) + '%';
    answer.focus();
  }

  function addChat(msg, type, extras) {
    if (!chat) return;
    var d = document.createElement('div');
    d.className = type === 'ai' ? 'chat-ai' : 'chat-user';
    var html = type === 'ai' ? '<div class="avatar"><i class="fas fa-robot"></i></div>' : '';
    html += '<div class="bubble">' + msg;
    if (extras && extras.suggestions) {
      html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">';
      extras.suggestions.forEach(function(s) {
        html += '<span data-pick="' + s.value + '" class="pick-chip" style="padding:8px 14px;border-radius:999px;font-size:13px;background:var(--muted);color:var(--fg);cursor:pointer;transition:all .15s;border:1.5px solid var(--border);">' + s.label + '</span>';
      });
      html += '</div>';
    }
    if (extras && extras.chips) {
      html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">';
      extras.chips.forEach(function(c) {
        var label = typeof c === 'string' ? c : (c.icon + ' ' + c.label);
        var val = typeof c === 'string' ? c : c.label;
        html += '<span data-pick="' + val + '" class="pick-chip" style="padding:10px 16px;border-radius:var(--radius);font-size:14px;background:var(--muted);color:var(--fg);cursor:pointer;transition:all .15s;border:1.5px solid var(--border);display:inline-flex;align-items:center;gap:6px;">' + label + '</span>';
      });
      html += '</div>';
    }
    html += '</div>';
    d.innerHTML = html;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }

  // Event delegation for chip clicks
  chat.addEventListener('click', function(e) {
    var chip = e.target.closest('.pick-chip');
    if (!chip) return;
    var val = chip.getAttribute('data-pick');
    if (!val || !answer) return;
    answer.value = val;
    // Highlight selected chip
    var allChips = chat.querySelectorAll('.pick-chip');
    allChips.forEach(function(c) { c.style.background = 'var(--muted)'; c.style.color = 'var(--fg)'; c.style.borderColor = 'var(--border)'; });
    chip.style.background = 'var(--accent)'; chip.style.color = '#fff'; chip.style.borderColor = 'var(--accent)';
    // Auto submit after brief highlight
    setTimeout(function() { send(); }, 200);
  });

  async function send() {
    if (!answer) return;
    var val = answer.value.trim();
    if (!val) return;
    var s = steps[step];
    answers[s.key] = val;
    addChat(val, 'user');
    answer.value = '';

    if (step < steps.length - 1) {
      step++;
      var nextS = steps[step];
      var extras = {};
      if (nextS.suggestions) extras.suggestions = nextS.suggestions;
      if (nextS.chips) extras.chips = nextS.chips;
      addChat(nextS.q, 'ai', extras);
      updateInput();
      answer.value = '';
    } else {
      generateTrip();
    }
  }

  async function generateTrip() {
    addChat('好的！开始为你规划...', 'ai');
    // AI progress animation
    var progressSteps = ['分析最佳旅行时间...','筛选热门地点...','计算路线距离...','生成每日安排...','准备预算方案...'];
    var progDiv = document.createElement('div');
    progDiv.className = 'chat-ai';
    progDiv.innerHTML = '<div class="avatar"><i class="fas fa-robot"></i></div><div class="bubble" id="aiProgress"><p style="font-size:13px;color:var(--muted-fg);">🤖 AI 正在规划中...</p></div>';
    chat.appendChild(progDiv);
    chat.scrollTop = chat.scrollHeight;

    for (var i = 0; i < progressSteps.length; i++) {
      await new Promise(function(r) { setTimeout(r, 400); });
      var pb = document.getElementById('aiProgress');
      if (pb) {
        pb.innerHTML = '<p style="font-size:13px;color:var(--muted-fg);">🤖 AI 正在规划中...</p>' +
          progressSteps.slice(0, i + 1).map(function(s) { return '<div style="font-size:12px;color:var(--success);margin-top:4px;">✓ ' + s + '</div>'; }).join('');
      }
      if (progress) progress.style.width = ((i + 1) / progressSteps.length * 100) + '%';
    }
    if (progress) progress.style.width = '100%';
    var footer = document.querySelector('.chat-footer');
    if (footer) footer.style.display = 'none';

    var numDays = parseInt(answers.days || 5);
    var numMembers = parseInt(answers.members || 1);
    var numBudget = parseInt(answers.budget || 5000);
    var tripDays = null;

    try {
        var aiResult = await callAITripPlan({
          destination: answers.destination,
          startDate: answers.startDate,
          numDays: numDays,
          members: numMembers,
          budget: numBudget,
          preferences: answers.preferences || ''
        });
        if (aiResult && aiResult.days && aiResult.days.length) {
          tripDays = aiResult.days.map(function(d, i) {
            return {
              id: 'ai-d' + Date.now() + '-' + i,
              date: d.date || answers.startDate,
              weather: d.weather || '☀️ 晴 25°C',
              tip: d.tip || '',
              places: (d.places || []).map(function(p) {
                return {
                  id: 'ai-p' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
                  name: p.name, cat: p.category || p.cat || '景点',
                  time: p.time_slot || p.time || '09:00',
                  duration: p.duration || '1h', fee: p.fee || '免费',
                  lat: p.lat || null, lng: p.lng || null
                };
              })
            };
          });
        }
      } catch (e) {}

      if (!tripDays || !tripDays.length) {
        var plan = generateTripPlan(answers.destination, answers.startDate, numDays, numMembers, numBudget, answers.preferences);
        tripDays = plan.days || [];
      }

      var startDate = answers.startDate || new Date().toISOString().split('T')[0];
      var endDate = new Date(startDate);
      if (isNaN(endDate.getTime())) endDate = new Date(); // fallback
      endDate.setDate(endDate.getDate() + numDays - 1);

      window._tripData = {
        name: answers.destination + '之旅', destination: answers.destination,
        startDate: answers.startDate, endDate: endDate.toISOString().split('T')[0],
        members: numMembers, days: tripDays, budget: numBudget, emoji: '🌏', readiness: 30
      };

      var html = '<div class="container" style="text-align:center;padding:40px 0;">';
      html += '<div style="font-size:64px;margin-bottom:16px;">🎉</div>';
      html += '<h2 style="font-family:var(--font-display);font-size:2rem;margin-bottom:8px;">行程已生成！</h2>';
      html += '<p style="color:var(--muted-fg);margin-bottom:8px;">' + answers.destination + '之旅 · ' + numDays + '天 · ' + answers.startDate + ' 出发</p>';

      for (var d = 0; d < tripDays.length; d++) {
        var day = tripDays[d];
        html += '<div class="card animate-in" style="margin-bottom:12px;text-align:left;">';
        html += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;"><span class="tag tag-blue">Day ' + (d + 1) + '</span><span style="font-size:13px;color:var(--muted-fg);">' + (day.weather || '☀️ 晴 25°C') + '</span></div>';
        for (var p = 0; p < day.places.length; p++) {
          var pl = day.places[p];
          var ci = pl.cat === '美食' ? '🍜' : pl.cat === '咖啡' ? '☕' : pl.cat === '购物' ? '🛍' : pl.cat === '住宿' ? '🏨' : '📍';
          html += '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;font-size:14px;"><span style="font-family:var(--font-mono);font-size:12px;color:var(--muted-fg);min-width:48px;">' + (pl.time || '09:00') + '</span><span>' + ci + '</span><span>' + pl.name + '</span></div>';
        }
        html += '</div>';
      }
      html += '<button class="btn btn-primary btn-lg btn-full" style="margin-top:24px;" onclick="confirmTrip()">✈️ 确认行程，开始旅程</button>';
      html += '<button class="btn btn-outline btn-lg btn-full" style="margin-top:12px;" onclick="location.reload()">🔄 重新生成</button></div>';

      var main = document.querySelector('#chatPhase main');
      if (main) main.innerHTML = html;
      var ft = document.querySelector('.chat-footer');
      if (ft) ft.style.display = 'none';
  }

  window.confirmTrip = function() {
    if (!window._tripData) return;
    var t = addTrip(window._tripData);
    location.href = 'trip-detail.html?id=' + t.id;
  };

  sendBtn.addEventListener('click', send);
  answer.addEventListener('keydown', function(e) { if (e.key === 'Enter') send(); });
  // Init — don't show chat until user clicks "开始规划"
  updateInput();
});
