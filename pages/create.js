/* Journey — Create Trip Page (AI Chat) */

safeRender(function() {
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
    if (s.type === 'chips' || s.type === 'styleChips') {
      answer.style.display = 'none';
      sendBtn.parentElement.style.display = 'none';
      if (stepHint) stepHint.textContent = '第 ' + (step + 1) + '/' + steps.length + ' 步 · 点击选择';
    } else {
      answer.style.display = '';
      sendBtn.parentElement.style.display = '';
      answer.type = s.type || 'text';
      answer.placeholder = s.placeholder;
      if (stepHint) stepHint.textContent = '第 ' + (step + 1) + '/' + steps.length + ' 步 · 按 Enter 发送';
    }
    if (stepIcon) stepIcon.textContent = s.icon;
    if (progress) progress.style.width = (step / steps.length * 100) + '%';
    if (answer.style.display !== 'none') answer.focus();
  }

  function addChat(msg, type, extras) {
    if (!chat) return;
    var d = document.createElement('div');
    d.className = type === 'ai' ? 'chat-ai' : 'chat-user';
    var html = type === 'ai' ? '<div class="avatar"><i class="fas fa-robot"></i></div>' : '';
    html += '<div class="bubble">' + msg;
    // Add suggestion chips/cards
    if (extras && extras.suggestions) {
      html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">';
      extras.suggestions.forEach(function(s) {
        html += '<span onclick="quickPick(\'' + s.value + '\')" style="padding:8px 14px;border-radius:999px;font-size:13px;background:var(--muted);color:var(--fg);cursor:pointer;transition:all .15s;border:1.5px solid var(--border);">' + s.label + '</span>';
      });
      html += '</div>';
    }
    if (extras && extras.chips) {
      html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">';
      extras.chips.forEach(function(c) {
        var label = typeof c === 'string' ? c : (c.icon + ' ' + c.label);
        var val = typeof c === 'string' ? c : c.label;
        html += '<span onclick="quickPick(\'' + val + '\')" style="padding:10px 16px;border-radius:var(--radius);font-size:14px;background:var(--muted);color:var(--fg);cursor:pointer;transition:all .15s;border:1.5px solid var(--border);display:inline-flex;align-items:center;gap:6px;">' + label + '</span>';
      });
      html += '</div>';
    }
    html += '</div>';
    d.innerHTML = html;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }

  window.quickPick = function(val) {
    if (!answer) return;
    answer.value = val;
    send();
  };

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
      addChat('好的！正在为你规划 ' + answers.destination + ' 的 ' + answers.days + ' 天旅行...', 'ai');
      if (progress) progress.style.width = '100%';
      var footer = document.querySelector('footer');
      if (footer) footer.innerHTML = '<div class="container" style="text-align:center;padding:20px;"><p style="color:var(--muted-fg);">🤖 AI 正在为您规划...</p></div>';

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

      var endDate = new Date(answers.startDate);
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

      var main = document.querySelector('main');
      if (main) main.innerHTML = html;
      if (footer) footer.style.display = 'none';
    }
  }

  window.confirmTrip = function() {
    if (!window._tripData) return;
    var t = addTrip(window._tripData);
    location.href = 'trip-detail.html?id=' + t.id;
  };

  sendBtn.addEventListener('click', send);
  answer.addEventListener('keydown', function(e) { if (e.key === 'Enter') send(); });
  // Show destination suggestions on first step
  var firstS = steps[0];
  if (firstS.suggestions) {
    addChat(firstS.q, 'ai', { suggestions: firstS.suggestions });
  }
  updateInput();
});
