/* Journey — AI Routes */

const express = require('express');
const router = express.Router();
const { db, genId } = require('../db');

// Config from environment
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';    // openai | claude | mock
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';

// ── AI Trip Plan Generation ──
// POST /api/ai/plan-trip
router.post('/plan-trip', async (req, res) => {
  const { destination, startDate, numDays, members, budget, preferences } = req.body;

  if (!destination || !startDate || !numDays) {
    return res.status(400).json({ error: 'destination, startDate, and numDays are required' });
  }

  try {
    const plan = await generateTripPlan({ destination, startDate, numDays, members, budget, preferences });
    res.json(plan);
  } catch (e) {
    console.error('AI trip plan error:', e.message);
    // Fall back to mock generator
    const plan = mockTripPlan({ destination, startDate, numDays, members, budget, preferences });
    res.json(plan);
  }
});

// ── AI Journal Generation ──
// POST /api/ai/journal
router.post('/journal', async (req, res) => {
  const { destination, startDate, endDate, numDays, members, places, expenses, highlights } = req.body;

  if (!destination) {
    return res.status(400).json({ error: 'destination is required' });
  }

  try {
    const journal = await generateJournal({ destination, startDate, endDate, numDays, members, places, expenses, highlights });
    res.json(journal);
  } catch (e) {
    console.error('AI journal error:', e.message);
    const journal = mockJournal({ destination, startDate, endDate, numDays, members, places, expenses, highlights });
    res.json(journal);
  }
});

// ── AI Call ──
async function callAI(systemPrompt, userPrompt) {
  if (AI_PROVIDER === 'mock' || !AI_API_KEY) {
    throw new Error('AI not configured — using mock');
  }

  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ── Trip Plan Generator ──
async function generateTripPlan(params) {
  const { destination, startDate, numDays, members, budget, preferences } = params;

  const systemPrompt = `你是一个专业的旅行规划师。根据用户的需求生成详细的旅行计划。你必须返回纯JSON，不要包含markdown代码块标记。

返回格式：
{
  "name": "目的地之旅",
  "destination": "目的地",
  "startDate": "开始日期",
  "endDate": "结束日期",
  "days": [
    {
      "date": "日期",
      "weather": "天气",
      "tip": "旅行小贴士",
      "places": [
        {
          "name": "地点名",
          "cat": "景点|美食|购物|咖啡|住宿|交通|其他",
          "time": "09:00",
          "duration": "1.5h",
          "fee": "免费或价格",
          "lat": 纬度数字,
          "lng": 经度数字
        }
      ]
    }
  ]
}`;

  const userPrompt = `请为以下旅行生成${numDays}天详细行程：
目的地：${destination}
开始日期：${startDate}
天数：${numDays}天
人数：${members || 1}人
预算：${budget || '不限'}
偏好：${preferences || '无特殊偏好'}

每天安排2-3个地点，包括景点、美食、购物等。每个地点提供准确的经纬度坐标。`;

  const content = await callAI(systemPrompt, userPrompt);
  return JSON.parse(content.trim());
}

// ── Journal Generator ──
async function generateJournal(params) {
  const { destination, startDate, endDate, numDays, members, places, expenses, highlights } = params;

  const systemPrompt = `你是一个温暖的旅行日志作者。根据用户的旅行数据生成一篇感性的旅行总结。你必须返回纯JSON：

返回格式：
{
  "coverSummary": "一段200-300字的旅行总结，情感丰富，有画面感",
  "highlights": ["标签1", "标签2", "标签3"]
}`;

  const userPrompt = `请为以下旅行生成日志总结：
目的地：${destination}
日期：${startDate || ''} - ${endDate || ''}
天数：${numDays || 0}天
人数：${members || 1}人
到访地点：${(places || []).join('、')}
亮点：${(highlights || ['旅行', '回忆']).join('、')}`;

  const content = await callAI(systemPrompt, userPrompt);
  return JSON.parse(content.trim());
}

// ── Mock Generators (fallback) ──
const PLACES_DB = {
  '日本东京': [
    { name:'浅草寺', cat:'景点', time:'09:00', duration:'1.5h', fee:'免费', lat:35.7148, lng:139.7967 },
    { name:'晴空塔', cat:'景点', time:'11:00', duration:'1.5h', fee:'¥2,100', lat:35.7101, lng:139.8107 },
    { name:'秋叶原', cat:'购物', time:'13:00', duration:'3h', fee:'--', lat:35.7023, lng:139.7745 },
    { name:'银座', cat:'购物', time:'15:30', duration:'2h', fee:'--', lat:35.6722, lng:139.7718 },
    { name:'筑地市场', cat:'美食', time:'08:00', duration:'1h', fee:'¥2,000', lat:35.6654, lng:139.7707 },
    { name:'涩谷', cat:'购物', time:'14:00', duration:'2h', fee:'--', lat:35.6580, lng:139.7016 },
    { name:'新宿御苑', cat:'景点', time:'10:00', duration:'1.5h', fee:'¥500', lat:35.6852, lng:139.7100 },
    { name:'明治神宫', cat:'景点', time:'09:00', duration:'1h', fee:'免费', lat:35.6764, lng:139.6993 },
    { name:'一兰拉面', cat:'美食', time:'12:00', duration:'0.5h', fee:'¥980', lat:35.7100, lng:139.8000 },
    { name:'迪士尼海洋', cat:'景点', time:'09:00', duration:'全天', fee:'¥8,900', lat:35.6274, lng:139.8863 },
  ],
  '四川成都': [
    { name:'大熊猫基地', cat:'景点', time:'08:30', duration:'3h', fee:'¥55', lat:30.7290, lng:104.1435 },
    { name:'宽窄巷子', cat:'景点', time:'12:00', duration:'1.5h', fee:'免费', lat:30.6697, lng:104.0596 },
    { name:'锦里', cat:'美食', time:'14:00', duration:'2h', fee:'--', lat:30.6478, lng:104.0539 },
    { name:'春熙路', cat:'购物', time:'16:00', duration:'2h', fee:'--', lat:30.6562, lng:104.0815 },
    { name:'武侯祠', cat:'景点', time:'09:00', duration:'1h', fee:'¥50', lat:30.6480, lng:104.0493 },
    { name:'蜀大侠火锅', cat:'美食', time:'12:00', duration:'1h', fee:'¥120', lat:30.6500, lng:104.0600 },
  ],
  '北京': [
    { name:'故宫', cat:'景点', time:'08:30', duration:'4h', fee:'¥60', lat:39.9163, lng:116.3972 },
    { name:'天安门广场', cat:'景点', time:'08:00', duration:'1h', fee:'免费', lat:39.9054, lng:116.3976 },
    { name:'颐和园', cat:'景点', time:'09:00', duration:'3h', fee:'¥30', lat:39.9999, lng:116.2755 },
    { name:'四季民福烤鸭店', cat:'美食', time:'12:00', duration:'1h', fee:'¥150', lat:39.9100, lng:116.4000 },
    { name:'南锣鼓巷', cat:'购物', time:'15:30', duration:'2h', fee:'免费', lat:39.9380, lng:116.4034 },
    { name:'798艺术区', cat:'景点', time:'14:00', duration:'2h', fee:'免费', lat:39.9842, lng:116.4951 },
  ],
  '上海': [
    { name:'外滩', cat:'景点', time:'18:00', duration:'1h', fee:'免费', lat:31.2400, lng:121.4906 },
    { name:'南京路步行街', cat:'购物', time:'14:00', duration:'2h', fee:'免费', lat:31.2363, lng:121.4802 },
    { name:'豫园', cat:'景点', time:'09:00', duration:'2h', fee:'¥40', lat:31.2290, lng:121.4924 },
    { name:'新天地', cat:'咖啡', time:'15:00', duration:'1h', fee:'¥60', lat:31.2194, lng:121.4753 },
    { name:'迪士尼乐园', cat:'景点', time:'09:00', duration:'全天', fee:'¥475', lat:31.1440, lng:121.6600 },
    { name:'武康路', cat:'景点', time:'10:00', duration:'1h', fee:'免费', lat:31.2076, lng:121.4416 },
  ],
};

function mockTripPlan(params) {
  const { destination, startDate, numDays } = params;
  let places = PLACES_DB[destination];
  if (!places) {
    const key = Object.keys(PLACES_DB).find(k => destination.includes(k.replace(/^(日本|韩国|泰国|四川|云南)/,'')) || k.includes(destination));
    places = PLACES_DB[key] || PLACES_DB['日本东京'];
  }

  const weathers = ['☀️ 晴 25°C', '⛅ 多云 22°C', '☀️ 晴 28°C', '🌧 小雨 18°C', '☁️ 阴 20°C'];
  const tips = ['今天预计步行 16km，下午可能下雨，建议带伞 ☂️', '早上去人少，拍照最佳 📸', '记得涂防晒，多喝水 💧', '附近有不错的咖啡馆 ☕', '轻松行程，慢慢逛 🚶'];

  const days = [];
  const ppd = Math.min(3, Math.ceil(places.length / numDays));
  let idx = 0;
  for (let d = 0; d < numDays; d++) {
    const dayPlaces = [];
    for (let p = 0; p < ppd && idx < places.length; p++) {
      dayPlaces.push({ ...places[idx], id: genId() });
      idx++;
    }
    const date = new Date(new Date(startDate).getTime() + d * 86400000).toISOString().split('T')[0];
    days.push({ date, weather: weathers[d % weathers.length], tip: tips[d % tips.length], places: dayPlaces });
  }

  const endDate = new Date(new Date(startDate).getTime() + (numDays - 1) * 86400000).toISOString().split('T')[0];
  return { name: destination + '之旅', destination, startDate, endDate, days };
}

function mockJournal(params) {
  const { destination, places } = params;
  const summaries = {
    '日本东京': '东京是一座让人着迷的城市，传统与现代在这里完美交融。从浅草寺的古朴宁静到涩谷的繁华喧嚣，每一天都充满了惊喜。清晨在筑地市场品尝最新鲜的寿司，黄昏在晴空塔俯瞰整座城市的灯火。东京的街道干净整洁，每一处转角都能发现独特的风景。这段旅程不仅是一次观光，更是一次文化的沉浸——在茶道的仪式感中体会日本的匠心精神，在秋叶原的霓虹灯下感受二次元文化的活力。',
    '四川成都': '成都是一座来了就不想走的城市。大熊猫基地里那些憨态可掬的国宝，宽窄巷子里飘散的盖碗茶香，锦里夜市中人声鼎沸的烟火气——每一刻都让人沉醉。最难忘的当属那顿地道的四川火锅，麻辣鲜香在舌尖绽放，配上一碗冰粉，简直完美。成都人悠闲的生活态度感染了我们，坐在人民公园的茶馆里，看着老人们打麻将、掏耳朵，时光仿佛都慢了下来。',
    '上海': '上海是一座永远充满活力的城市。外滩的万国建筑群在黄昏时分格外迷人，对岸陆家嘴的摩天大楼闪烁着未来的光芒。漫步在武康路的梧桐树下，寻找那些隐藏在小巷里的咖啡馆和独立书店，是此行最惬意的时光。南京路上的人潮涌动，豫园的园林精致典雅，这座城市总能在繁华与静谧之间找到完美的平衡。',
  };

  const key = Object.keys(summaries).find(k => destination.includes(k) || k.includes(destination));
  return {
    coverSummary: summaries[key] || `这次${destination || ''}之旅令人难忘。每一段旅程都有独特的风景和故事，期待下一次出发。`,
    highlights: ['旅行', '美食', '探索', destination || '', '回忆']
  };
}

module.exports = router;
