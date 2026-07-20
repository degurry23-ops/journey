/* Journey — Create Trip Page (AI Chat) */

safeRender(function() {
  var steps = [
    { q: 'Hi！准备去哪里旅行？', icon: '🌏', hint: '输入你想去的城市或国家', key: 'destination', placeholder: '例如：日本东京' },
    { q: '什么时候出发？', icon: '📅', hint: '告诉我出发日期就好', key: 'startDate', placeholder: '选择日期', type: 'date' },
    { q: '准备玩几天？', icon: '📆', hint: '3天、5天、一周都可以~', key: 'days', placeholder: '例如：5', type: 'number' },
    { q: '几个人一起呀？', icon: '👥', hint: '算上你自己哦', key: 'members', placeholder: '例如：4', type: 'number' },
    { q: '预算大概多少？（每人）', icon: '💰', hint: '大概数字就行，不用太精确', key: 'budget', placeholder: '例如：8000', type: 'number' },
    { q: '最后，有没有特别想体验的？', icon: '🎯', hint: '选几个关键词，AI 帮你安排', key: 'preferences', placeholder: '例如：动漫、美食、购物' }
  ];

  var step = 0;
  var answers = {};

  var chat = document.getElementById('chat');
  var answer = document.getElementById('answer');
  var sendBtn = document.getElementById('sendBtn');
  var progress = document.getElementById('progress');
  var stepIcon = document.getElementById('stepIcon');
  var stepHint = document.getElementById('stepHint');

  function updateInput() {
    var s = steps[step];
    answer.type = s.type || 'text';
    answer.placeholder = s.placeholder;
    stepIcon.textContent = s.icon;
    stepHint.textContent = '第 ' + (step + 1) + '/' + steps.length + ' 步 · 按 Enter 发送';
    progress.style.width = (step / steps.length * 100) + '%';
    answer.focus();
  }

  function addChat(msg, type) {
    var d = document.createElement('div');
    d.className = type === 'ai' ? 'chat-ai' : 'chat-user';
    if (type === 'ai') {
      d.innerHTML = '<div class="avatar"><i class="fas fa-robot"></i></div><div class="bubble">' + msg + '</div>';
    } else {
      d.innerHTML = '<div class="bubble">' + msg + '</div>';
    }
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }

  async function send() {
    var val = answer.value.trim();
    if (!val) return;
    var s = steps[step];
    answers[s.key] = val;
    addChat(val, 'user');

    if (step < steps.length - 1) {
      step++;
      addChat(steps[step].q, 'ai');
      updateInput();
      answer.value = '';
    } else {
      addChat('好的！正在为你规划 ' + answers.destination + ' 的 ' + answers.days + ' 天旅行...', 'ai');
      progress.style.width = '100%';
      document.querySelector('footer').innerHTML = '<div class="container" style="text-align:center;padding:20px;"><p style="color:var(--muted-fg);">🤖 AI 正在为您规划...</p></div>';

      var numDays = parseInt(answers.days || 5);
      var numMembers = parseInt(answers.members || 1);
      var numBudget = parseInt(answers.budget || 5000);
      var tripDays = null;

      // Try AI
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
                  name: p.name,
                  cat: p.category || p.cat || '景点',
                  time: p.time_slot || p.time || '09:00',
                  duration: p.duration || '1h',
                  fee: p.fee || '免费',
                  lat: p.lat || null,
                  lng: p.lng || null
                };
              })
            };
          });
        }
      } catch (e) { /* fallback to mock */ }

      if (!tripDays || !tripDays.length) {
        tripDays = generateTripPlan(answers.destination, answers.startDate, numDays, numMembers, numBudget, answers.preferences).days;
      }

      var endDate = new Date(answers.startDate);
      endDate.setDate(endDate.getDate() + numDays - 1);

      window._tripData = {
        name: answers.destination + '之旅',
        destination: answers.destination,
        startDate: answers.startDate,
        endDate: endDate.toISOString().split('T')[0],
        members: numMembers,
        days: tripDays,
        budget: numBudget,
        emoji: '🌏',
        readiness: 30
      };

      var html = '<div class="container" style="text-align:center;padding:40px 0;">';
      html += '<div style="font-size:64px;margin-bottom:16px;">🎉</div>';
      html += '<h2 style="font-family:var(--font-display);font-size:2rem;margin-bottom:8px;">行程已生成！</h2>';
      html += '<p style="color:var(--muted-fg);margin-bottom:8px;">' + answers.destination + '之旅 · ' + numDays + '天 · ' + answers.startDate + ' 出发</p>';
      html += '<p style="color:var(--accent);font-size:12px;margin-bottom:24px;">' + (tripDays.length && tripDays[0].id && tripDays[0].id.indexOf('ai-') === 0 ? '🤖 AI 生成' : '📋 模板生成') + '</p>';

      for (var d = 0; d < tripDays.length; d++) {
        var day = tripDays[d];
        html += '<div class="card animate-in" style="margin-bottom:12px;text-align:left;">';
        html += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;"><span class="tag tag-blue">Day ' + (d + 1) + '</span><span style="font-size:13px;color:var(--muted-fg);">' + (day.weather || '☀️ 晴 25°C') + '</span></div>';
        for (var p = 0; p < day.places.length; p++) {
          var pl = day.places[p];
          var catIcon = pl.cat === '美食' ? '🍜' : pl.cat === '咖啡' ? '☕' : pl.cat === '购物' ? '🛍' : pl.cat === '住宿' ? '🏨' : '📍';
          html += '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;font-size:14px;"><span style="font-family:var(--font-mono);font-size:12px;color:var(--muted-fg);min-width:48px;">' + (pl.time || '09:00') + '</span><span>' + catIcon + '</span><span>' + pl.name + '</span></div>';
        }
        html += '</div>';
      }
      html += '<button class="btn btn-primary btn-lg btn-full" style="margin-top:24px;" onclick="confirmTrip()">✈️ 确认行程，开始旅程</button>';
      html += '<button class="btn btn-outline btn-lg btn-full" style="margin-top:12px;" onclick="location.reload()">🔄 重新生成</button></div>';
      document.querySelector('main').innerHTML = html;
      document.querySelector('footer').style.display = 'none';
    }
  }

  window.confirmTrip = function() {
    var t = addTrip(window._tripData);
    location.href = 'trip-detail.html?id=' + t.id;
  };

  sendBtn.addEventListener('click', send);
  answer.addEventListener('keydown', function(e) { if (e.key === 'Enter') send(); });
  updateInput();
});
