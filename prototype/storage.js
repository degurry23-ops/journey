// Journey Prototype — Shared Data Layer
// All pages use this for trip management

const STORAGE_KEY = 'journey_proto_trips';

function loadTrips() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || getSampleTrips(); }
  catch(e) { return getSampleTrips(); }
}

function saveTrips(trips) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

function getSampleTrips() {
  return [
    {
      id: 'sample-1', name: '东京之旅', destination: '日本东京',
      startDate: '2026-08-02', endDate: '2026-08-06', days: 5, members: 4,
      status: 'planning', readiness: 65,
      emoji: '🇯🇵',
      days: [
        { id:'d1-1', date:'2026-08-02', weather:'☀️ 晴 25°C', tip:'今天预计步行 16km，下午可能下雨，建议带伞',
          places:[
            { id:'p1-1', name:'浅草寺', cat:'景点', time:'09:00', duration:'1.5h', fee:'免费', lat:35.7148, lng:139.7967 },
            { id:'p1-2', name:'晴空塔', cat:'景点', time:'11:00', duration:'1.5h', fee:'¥2,100', lat:35.7101, lng:139.8107 },
            { id:'p1-3', name:'秋叶原', cat:'购物', time:'13:00', duration:'3h', fee:'--', lat:35.7023, lng:139.7745 }
          ]
        },
        { id:'d1-2', date:'2026-08-03', weather:'⛅ 多云 22°C', tip:'筑地市场早上去最新鲜，8点前到',
          places:[
            { id:'p1-4', name:'筑地市场', cat:'美食', time:'08:00', duration:'1h', fee:'¥2,000', lat:35.6654, lng:139.7707 },
            { id:'p1-5', name:'银座', cat:'购物', time:'10:00', duration:'2h', fee:'--', lat:35.6722, lng:139.7718 },
            { id:'p1-6', name:'涩谷', cat:'购物', time:'14:00', duration:'2h', fee:'--', lat:35.6580, lng:139.7016 }
          ]
        },
        { id:'d1-3', date:'2026-08-04', weather:'☀️ 晴 28°C', tip:'明治神宫早上去人少，适合拍照',
          places:[
            { id:'p1-7', name:'明治神宫', cat:'景点', time:'09:00', duration:'1h', fee:'免费', lat:35.6764, lng:139.6993 },
            { id:'p1-8', name:'新宿御苑', cat:'景点', time:'10:30', duration:'1.5h', fee:'¥500', lat:35.6852, lng:139.7100 }
          ]
        },
        { id:'d1-4', date:'2026-08-05', weather:'🌧 小雨 18°C', tip:'下雨天适合逛博物馆和室内景点',
          places:[{ id:'p1-9', name:'迪士尼海洋', cat:'景点', time:'09:00', duration:'全天', fee:'¥8,900', lat:35.6274, lng:139.8863 }]
        },
        { id:'d1-5', date:'2026-08-06', weather:'☁️ 阴 20°C', tip:'最后一天轻松逛，留时间去机场',
          places:[
            { id:'p1-10', name:'Blue Bottle Coffee', cat:'咖啡', time:'09:00', duration:'0.5h', fee:'¥550', lat:35.7100, lng:139.8100 },
            { id:'p1-11', name:'自由探索', cat:'其他', time:'12:00', duration:'--', fee:'--' }
          ]
        }
      ],
      expenses: [
        { id:'e1-1', cat:'餐饮', amount:980, note:'一兰拉面', payer:'我', date:'2026-08-02', dayId:'d1-1' },
        { id:'e1-2', cat:'交通', amount:500, note:'Suica充值', payer:'小月', date:'2026-08-02', dayId:'d1-1' },
        { id:'e1-3', cat:'门票', amount:2100, note:'晴空塔', payer:'小林', date:'2026-08-02', dayId:'d1-1' }
      ]
    },
    {
      id: 'sample-2', name: '成都之旅', destination: '四川成都',
      startDate: '2026-07-18', endDate: '2026-07-22', days: 5, members: 4,
      status: 'traveling', readiness: 85,
      emoji: '🐼',
      days: [
        { id:'d2-1', date:'2026-07-18', weather:'☀️ 晴 32°C', tip:'成都夏天热，记得多喝水',
          places:[
            { id:'p2-1', name:'大熊猫基地', cat:'景点', time:'08:30', duration:'3h', fee:'¥55', lat:30.7290, lng:104.1435 },
            { id:'p2-2', name:'宽窄巷子', cat:'景点', time:'12:00', duration:'1.5h', fee:'免费', lat:30.6697, lng:104.0596 },
            { id:'p2-3', name:'锦里', cat:'美食', time:'14:00', duration:'2h', fee:'--', lat:30.6478, lng:104.0539 }
          ]
        },
        { id:'d2-2', date:'2026-07-19', weather:'⛅ 多云 30°C', tip:'武侯祠和锦里很近，可以一起逛',
          places:[
            { id:'p2-4', name:'武侯祠', cat:'景点', time:'09:00', duration:'1h', fee:'¥50', lat:30.6480, lng:104.0493 },
            { id:'p2-5', name:'春熙路', cat:'购物', time:'14:00', duration:'2h', fee:'--', lat:30.6562, lng:104.0815 }
          ]
        }
      ],
      expenses: [
        { id:'e2-1', cat:'餐饮', amount:450, note:'火锅', payer:'我', date:'2026-07-18', dayId:'d2-1' },
        { id:'e2-2', cat:'门票', amount:55, note:'熊猫基地', payer:'阿明', date:'2026-07-18', dayId:'d2-1' }
      ]
    },
    {
      id: 'sample-3', name: '上海之旅', destination: '上海',
      startDate: '2026-05-10', endDate: '2026-05-13', days: 4, members: 2,
      status: 'completed', readiness: 100,
      emoji: '🌆',
      days: [
        { id:'d3-1', date:'2026-05-10', weather:'☀️ 晴 26°C', tip:'外滩夜景必看',
          places:[
            { id:'p3-1', name:'外滩', cat:'景点', time:'18:00', duration:'1h', fee:'免费', lat:31.2400, lng:121.4906 },
            { id:'p3-2', name:'南京路', cat:'购物', time:'14:00', duration:'2h', fee:'--', lat:31.2363, lng:121.4802 }
          ]
        }
      ],
      expenses: [
        { id:'e3-1', cat:'餐饮', amount:380, note:'小笼包', payer:'我', date:'2026-05-10', dayId:'d3-1' }
      ]
    },
    {
      id: 'sample-4', name: '大理之旅', destination: '云南大理',
      startDate: '2026-03-05', endDate: '2026-03-07', days: 3, members: 2,
      status: 'completed', readiness: 100,
      emoji: '🏔️',
      days: [
        { id:'d4-1', date:'2026-03-05', weather:'☀️ 晴 22°C', tip:'洱海骑行是最佳体验',
          places:[
            { id:'p4-1', name:'洱海', cat:'景点', time:'09:00', duration:'4h', fee:'免费', lat:25.6064, lng:100.2329 },
            { id:'p4-2', name:'大理古城', cat:'景点', time:'14:00', duration:'3h', fee:'免费', lat:25.6891, lng:100.1615 }
          ]
        }
      ],
      expenses: [
        { id:'e4-1', cat:'餐饮', amount:220, note:'白族美食', payer:'我', date:'2026-03-05', dayId:'d4-1' }
      ]
    }
  ];
}

// Init if empty
if (!localStorage.getItem(STORAGE_KEY)) {
  saveTrips(getSampleTrips());
}

function getTripById(id) {
  return loadTrips().find(t => t.id === id) || null;
}

function addTrip(trip) {
  const trips = loadTrips();
  const newTrip = {
    ...trip,
    id: 'trip-' + Date.now(),
    status: trip.status || 'planning',
    expenses: trip.expenses || [],
    created: new Date().toISOString()
  };
  trips.unshift(newTrip);
  saveTrips(trips);
  return newTrip;
}

function updateTrip(id, updates) {
  const trips = loadTrips();
  const i = trips.findIndex(t => t.id === id);
  if (i >= 0) { trips[i] = { ...trips[i], ...updates }; saveTrips(trips); return trips[i]; }
  return null;
}

function deleteTrip(id) {
  saveTrips(loadTrips().filter(t => t.id !== id));
}

// Helpers
function formatDate(d) { const dt=new Date(d); return (dt.getMonth()+1)+'月'+dt.getDate()+'日'; }
function formatFullDate(d) { const dt=new Date(d); return dt.getFullYear()+'.'+String(dt.getMonth()+1).padStart(2,'0')+'.'+String(dt.getDate()).padStart(2,'0'); }
function daysBetween(a,b) { return Math.ceil((new Date(b)-new Date(a))/86400000); }
function formatMoney(n) { return '¥'+Number(n).toLocaleString(); }
function genId() { return 'id-'+Date.now()+'-'+Math.random().toString(36).slice(2,7); }

// AI mock trip generator
function generateTripPlan(destination, startDate, numDays, members, budget, preferences) {
  const placesDb = {
    '日本东京': [
      { name:'浅草寺', cat:'景点', time:'09:00', duration:'1.5h', fee:'免费', lat:35.7148, lng:139.7967 },
      { name:'晴空塔', cat:'景点', time:'11:00', duration:'1.5h', fee:'¥2,100', lat:35.7101, lng:139.8107 },
      { name:'秋叶原', cat:'购物', time:'13:00', duration:'3h', fee:'--', lat:35.7023, lng:139.7745 },
      { name:'Blue Bottle Coffee', cat:'咖啡', time:'09:00', duration:'0.5h', fee:'¥550', lat:35.7100, lng:139.8100 },
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
    ]
  };

  const places = placesDb[destination] || placesDb['日本东京'];
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
    days.push({
      id: genId(),
      date: new Date(new Date(startDate).getTime() + d*86400000).toISOString().split('T')[0],
      weather: weathers[d % weathers.length],
      tip: tips[d % tips.length],
      places: dayPlaces
    });
  }

  return {
    name: destination + '之旅',
    destination,
    startDate,
    endDate: new Date(new Date(startDate).getTime() + (numDays-1)*86400000).toISOString().split('T')[0],
    days: numDays,
    members,
    budget,
    preferences,
    days: days,
    emoji: '🌏',
    readiness: 30
  };
}
