// Journey Prototype — Shared Data Layer
// All pages use this for trip management

const STORAGE_KEY = 'journey_proto_trips';

function loadTrips() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getSampleTrips();
    var data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length === 0) return getSampleTrips();
    data.forEach(function(t) {
      if (t.expenses) t.expenses.forEach(function(e) { e.amount = Number(e.amount) || 0; });
      if (t.readiness == null) t.readiness = 0;
    });
    return data;
  } catch(e) { return getSampleTrips(); }
}

function saveTrips(trips) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

function getSampleTrips() {
  return [
    {
      id: 'sample-1', name: '东京之旅', destination: '日本东京', budget: 8000,
      startDate: '2026-08-02', endDate: '2026-08-08', members: 4,
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
        { id:'d1-5', date:'2026-08-06', weather:'☁️ 阴 20°C', tip:'teamLab要提前预约，建议买早场票',
          places:[
            { id:'p1-10', name:'teamLab Borderless', cat:'景点', time:'10:00', duration:'2h', fee:'¥3,200', lat:35.6264, lng:139.7817 },
            { id:'p1-11', name:'台场', cat:'购物', time:'13:00', duration:'3h', fee:'--', lat:35.6257, lng:139.7756 },
            { id:'p1-12', name:'大江户温泉', cat:'景点', time:'17:00', duration:'2h', fee:'¥2,480', lat:35.6250, lng:139.7800 }
          ]
        },
        { id:'d1-6', date:'2026-08-07', weather:'☀️ 晴 27°C', tip:'镰仓一天足够，坐江之电最方便',
          places:[
            { id:'p1-13', name:'镰仓大佛', cat:'景点', time:'09:30', duration:'1h', fee:'¥300', lat:35.3169, lng:139.5357 },
            { id:'p1-14', name:'江之岛', cat:'景点', time:'11:00', duration:'3h', fee:'免费', lat:35.3003, lng:139.4810 },
            { id:'p1-15', name:'镰仓高校前站', cat:'景点', time:'15:00', duration:'0.5h', fee:'免费', lat:35.3046, lng:139.4994 }
          ]
        },
        { id:'d1-7', date:'2026-08-08', weather:'⛅ 多云 23°C', tip:'最后一天轻松逛，留时间去机场',
          places:[
            { id:'p1-16', name:'Blue Bottle Coffee', cat:'咖啡', time:'09:00', duration:'0.5h', fee:'¥550', lat:35.7100, lng:139.8100 },
            { id:'p1-17', name:'上野公园', cat:'景点', time:'10:30', duration:'1.5h', fee:'免费', lat:35.7146, lng:139.7732 },
            { id:'p1-18', name:'阿美横丁', cat:'购物', time:'13:00', duration:'1.5h', fee:'--', lat:35.7100, lng:139.7750 }
          ]
        }
      ],
      expenses: [
        { id:'e1-1', cat:'餐饮', amount:980, note:'一兰拉面', payer:'我', date:'2026-08-02', dayId:'d1-1' },
        { id:'e1-2', cat:'交通', amount:500, note:'Suica充值', payer:'小月', date:'2026-08-02', dayId:'d1-1' },
        { id:'e1-3', cat:'门票', amount:2100, note:'晴空塔', payer:'小林', date:'2026-08-02', dayId:'d1-1' },
        { id:'e1-4', cat:'门票', amount:8900, note:'迪士尼海洋', payer:'我', date:'2026-08-05', dayId:'d1-4' },
        { id:'e1-5', cat:'门票', amount:3200, note:'teamLab', payer:'阿明', date:'2026-08-06', dayId:'d1-5' },
        { id:'e1-6', cat:'交通', amount:1500, note:'镰仓江之电一日券', payer:'小月', date:'2026-08-07', dayId:'d1-6' }
      ]
    },
    {
      id: 'sample-2', name: '成都之旅', destination: '四川成都', budget: 5000,
      startDate: '2026-07-18', endDate: '2026-07-22', members: 4,
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
            { id:'p2-5', name:'春熙路', cat:'购物', time:'14:00', duration:'2h', fee:'--', lat:30.6562, lng:104.0815 },
            { id:'p2-6', name:'蜀大侠火锅', cat:'美食', time:'18:00', duration:'1h', fee:'¥120', lat:30.6500, lng:104.0600 }
          ]
        },
        { id:'d2-3', date:'2026-07-20', weather:'🌧 小雨 26°C', tip:'下雨天适合逛博物馆，人民公园喝茶听雨',
          places:[
            { id:'p2-7', name:'四川博物院', cat:'景点', time:'09:30', duration:'2h', fee:'免费', lat:30.6620, lng:104.0340 },
            { id:'p2-8', name:'人民公园', cat:'景点', time:'14:00', duration:'1.5h', fee:'免费', lat:30.6596, lng:104.0570 },
            { id:'p2-9', name:'鹤鸣茶社', cat:'咖啡', time:'15:30', duration:'1h', fee:'¥30', lat:30.6598, lng:104.0575 }
          ]
        },
        { id:'d2-4', date:'2026-07-21', weather:'☀️ 晴 31°C', tip:'青城山建议坐索道上山，节省体力',
          places:[
            { id:'p2-10', name:'青城山', cat:'景点', time:'08:00', duration:'5h', fee:'¥90', lat:30.8990, lng:103.5680 },
            { id:'p2-11', name:'都江堰', cat:'景点', time:'14:00', duration:'2h', fee:'¥80', lat:31.0022, lng:103.6222 }
          ]
        },
        { id:'d2-5', date:'2026-07-22', weather:'⛅ 多云 28°C', tip:'最后一天买点特产，兔头必带',
          places:[
            { id:'p2-12', name:'九眼桥', cat:'景点', time:'10:00', duration:'1h', fee:'免费', lat:30.6453, lng:104.0819 },
            { id:'p2-13', name:'太古里', cat:'购物', time:'13:00', duration:'2h', fee:'--', lat:30.6520, lng:104.0830 }
          ]
        }
      ],
      expenses: [
        { id:'e2-1', cat:'餐饮', amount:450, note:'火锅', payer:'我', date:'2026-07-18', dayId:'d2-1' },
        { id:'e2-2', cat:'门票', amount:55, note:'熊猫基地', payer:'阿明', date:'2026-07-18', dayId:'d2-1' },
        { id:'e2-3', cat:'餐饮', amount:120, note:'蜀大侠火锅', payer:'小林', date:'2026-07-19', dayId:'d2-2' },
        { id:'e2-4', cat:'门票', amount:170, note:'青城山+都江堰', payer:'我', date:'2026-07-21', dayId:'d2-4' },
        { id:'e2-5', cat:'交通', amount:300, note:'租车', payer:'阿明', date:'2026-07-21', dayId:'d2-4' }
      ]
    },
    {
      id: 'sample-3', name: '上海之旅', destination: '上海', budget: 3000,
      startDate: '2026-05-10', endDate: '2026-05-13', members: 2,
      status: 'completed', readiness: 100,
      emoji: '🌆',
      days: [
        { id:'d3-1', date:'2026-05-10', weather:'☀️ 晴 26°C', tip:'外滩夜景必看，建议黄昏时分到达',
          places:[
            { id:'p3-1', name:'外滩', cat:'景点', time:'18:00', duration:'1.5h', fee:'免费', lat:31.2400, lng:121.4906 },
            { id:'p3-2', name:'南京路步行街', cat:'购物', time:'14:00', duration:'2h', fee:'--', lat:31.2363, lng:121.4802 },
            { id:'p3-3', name:'和平饭店', cat:'景点', time:'20:00', duration:'0.5h', fee:'免费', lat:31.2415, lng:121.4910 }
          ]
        },
        { id:'d3-2', date:'2026-05-11', weather:'⛅ 多云 24°C', tip:'豫园早上人少，建议9点前到',
          places:[
            { id:'p3-4', name:'豫园', cat:'景点', time:'09:00', duration:'2h', fee:'¥40', lat:31.2290, lng:121.4924 },
            { id:'p3-5', name:'新天地', cat:'咖啡', time:'13:00', duration:'1.5h', fee:'¥60', lat:31.2194, lng:121.4753 },
            { id:'p3-6', name:'田子坊', cat:'购物', time:'15:30', duration:'1.5h', fee:'免费', lat:31.2098, lng:121.4692 }
          ]
        },
        { id:'d3-3', date:'2026-05-12', weather:'☀️ 晴 28°C', tip:'迪士尼全天游玩，记得提前下载APP预约项目',
          places:[
            { id:'p3-7', name:'迪士尼乐园', cat:'景点', time:'09:00', duration:'全天', fee:'¥475', lat:31.1440, lng:121.6600 }
          ]
        },
        { id:'d3-4', date:'2026-05-13', weather:'☁️ 阴 22°C', tip:'最后一天轻松逛，武康路适合拍照',
          places:[
            { id:'p3-8', name:'武康路', cat:'景点', time:'10:00', duration:'1.5h', fee:'免费', lat:31.2076, lng:121.4416 },
            { id:'p3-9', name:'小笼包', cat:'美食', time:'12:00', duration:'0.5h', fee:'¥40', lat:31.2300, lng:121.4800 }
          ]
        }
      ],
      expenses: [
        { id:'e3-1', cat:'餐饮', amount:380, note:'小笼包', payer:'我', date:'2026-05-10', dayId:'d3-1' },
        { id:'e3-2', cat:'门票', amount:40, note:'豫园', payer:'我', date:'2026-05-11', dayId:'d3-2' },
        { id:'e3-3', cat:'门票', amount:475, note:'迪士尼', payer:'我', date:'2026-05-12', dayId:'d3-3' },
        { id:'e3-4', cat:'交通', amount:200, note:'地铁+打车', payer:'小月', date:'2026-05-12', dayId:'d3-3' }
      ]
    },
    {
      id: 'sample-4', name: '大理之旅', destination: '云南大理', budget: 2500,
      startDate: '2026-03-05', endDate: '2026-03-07', members: 2,
      status: 'completed', readiness: 100,
      emoji: '🏔️',
      days: [
        { id:'d4-1', date:'2026-03-05', weather:'☀️ 晴 22°C', tip:'洱海骑行是最佳体验，建议租电动车',
          places:[
            { id:'p4-1', name:'洱海', cat:'景点', time:'09:00', duration:'4h', fee:'免费', lat:25.6064, lng:100.2329 },
            { id:'p4-2', name:'大理古城', cat:'景点', time:'14:00', duration:'3h', fee:'免费', lat:25.6891, lng:100.1615 }
          ]
        },
        { id:'d4-2', date:'2026-03-06', weather:'⛅ 多云 18°C', tip:'苍山索道上午去，下午风大可能停运',
          places:[
            { id:'p4-3', name:'苍山', cat:'景点', time:'08:00', duration:'5h', fee:'¥40', lat:25.6570, lng:100.1080 },
            { id:'p4-4', name:'喜洲古镇', cat:'景点', time:'14:00', duration:'2h', fee:'免费', lat:25.8560, lng:100.1190 }
          ]
        },
        { id:'d4-3', date:'2026-03-07', weather:'☀️ 晴 20°C', tip:'双廊适合发呆看日落，慢慢逛',
          places:[
            { id:'p4-5', name:'双廊古镇', cat:'景点', time:'10:00', duration:'2h', fee:'免费', lat:25.8900, lng:100.2300 },
            { id:'p4-6', name:'白族美食', cat:'美食', time:'12:30', duration:'1h', fee:'¥60', lat:25.6900, lng:100.1600 }
          ]
        }
      ],
      expenses: [
        { id:'e4-1', cat:'餐饮', amount:220, note:'白族美食', payer:'我', date:'2026-03-05', dayId:'d4-1' },
        { id:'e4-2', cat:'门票', amount:40, note:'苍山索道', payer:'我', date:'2026-03-06', dayId:'d4-2' },
        { id:'e4-3', cat:'交通', amount:150, note:'电动车租赁', payer:'小月', date:'2026-03-05', dayId:'d4-1' }
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

// Currency by destination
var CURRENCY_MAP = {
  '日本东京': { sym: '¥', code: 'JPY', rate: 0.05 },   // 1 JPY ≈ 0.05 CNY
  '日本':   { sym: '¥', code: 'JPY', rate: 0.05 },
  '韩国首尔': { sym: '₩', code: 'KRW', rate: 0.005 },  // 1 KRW ≈ 0.005 CNY
  '韩国':   { sym: '₩', code: 'KRW', rate: 0.005 },
  '泰国曼谷': { sym: '฿', code: 'THB', rate: 0.2 },    // 1 THB ≈ 0.2 CNY
  '泰国':   { sym: '฿', code: 'THB', rate: 0.2 }
};
function getCurrency(dest) {
  for (var k in CURRENCY_MAP) {
    if (dest && dest.indexOf(k.replace(/^(日本|韩国|泰国|四川|云南)/,'')) >= 0) return CURRENCY_MAP[k];
  }
  return { sym: '¥', code: 'CNY', rate: 1 };
}
function formatAmount(amount, dest) {
  var cur = getCurrency(dest);
  return cur.sym + Number(amount || 0).toLocaleString();
}

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
      { name:'九眼桥', cat:'景点', time:'19:00', duration:'1h', fee:'免费', lat:30.6453, lng:104.0819 },
      { name:'蜀大侠火锅', cat:'美食', time:'12:00', duration:'1h', fee:'¥120', lat:30.6500, lng:104.0600 },
    ],
    '北京': [
      { name:'故宫', cat:'景点', time:'08:30', duration:'4h', fee:'¥60', lat:39.9163, lng:116.3972 },
      { name:'天安门广场', cat:'景点', time:'08:00', duration:'1h', fee:'免费', lat:39.9054, lng:116.3976 },
      { name:'景山公园', cat:'景点', time:'14:00', duration:'1h', fee:'¥2', lat:39.9226, lng:116.3961 },
      { name:'南锣鼓巷', cat:'购物', time:'15:30', duration:'2h', fee:'免费', lat:39.9380, lng:116.4034 },
      { name:'四季民福烤鸭店', cat:'美食', time:'12:00', duration:'1h', fee:'¥150', lat:39.9100, lng:116.4000 },
      { name:'颐和园', cat:'景点', time:'09:00', duration:'3h', fee:'¥30', lat:39.9999, lng:116.2755 },
      { name:'798艺术区', cat:'景点', time:'14:00', duration:'2h', fee:'免费', lat:39.9842, lng:116.4951 },
      { name:'簋街', cat:'美食', time:'18:00', duration:'1.5h', fee:'¥100', lat:39.9400, lng:116.4200 },
    ],
    '上海': [
      { name:'外滩', cat:'景点', time:'18:00', duration:'1h', fee:'免费', lat:31.2400, lng:121.4906 },
      { name:'南京路步行街', cat:'购物', time:'14:00', duration:'2h', fee:'免费', lat:31.2363, lng:121.4802 },
      { name:'豫园', cat:'景点', time:'09:00', duration:'2h', fee:'¥40', lat:31.2290, lng:121.4924 },
      { name:'新天地', cat:'咖啡', time:'15:00', duration:'1h', fee:'¥60', lat:31.2194, lng:121.4753 },
      { name:'田子坊', cat:'购物', time:'13:00', duration:'1.5h', fee:'免费', lat:31.2098, lng:121.4692 },
      { name:'小笼包', cat:'美食', time:'12:00', duration:'0.5h', fee:'¥40', lat:31.2300, lng:121.4800 },
      { name:'迪士尼乐园', cat:'景点', time:'09:00', duration:'全天', fee:'¥475', lat:31.1440, lng:121.6600 },
      { name:'武康路', cat:'景点', time:'10:00', duration:'1h', fee:'免费', lat:31.2076, lng:121.4416 },
    ],
    '重庆': [
      { name:'洪崖洞', cat:'景点', time:'18:00', duration:'1.5h', fee:'免费', lat:29.5642, lng:106.5852 },
      { name:'解放碑', cat:'购物', time:'14:00', duration:'1h', fee:'免费', lat:29.5603, lng:106.5766 },
      { name:'磁器口', cat:'景点', time:'10:00', duration:'2h', fee:'免费', lat:29.5817, lng:106.4523 },
      { name:'长江索道', cat:'交通', time:'16:00', duration:'0.5h', fee:'¥20', lat:29.5610, lng:106.5820 },
      { name:'重庆火锅', cat:'美食', time:'12:00', duration:'1h', fee:'¥100', lat:29.5600, lng:106.5700 },
      { name:'南山一棵树', cat:'景点', time:'19:00', duration:'1h', fee:'¥30', lat:29.5440, lng:106.6138 },
      { name:'鹅岭二厂', cat:'景点', time:'15:00', duration:'1h', fee:'免费', lat:29.5520, lng:106.5450 },
    ],
    '云南大理': [
      { name:'洱海', cat:'景点', time:'09:00', duration:'4h', fee:'免费', lat:25.6064, lng:100.2329 },
      { name:'大理古城', cat:'景点', time:'14:00', duration:'3h', fee:'免费', lat:25.6891, lng:100.1615 },
      { name:'苍山', cat:'景点', time:'08:00', duration:'5h', fee:'¥40', lat:25.6570, lng:100.1080 },
      { name:'喜洲古镇', cat:'景点', time:'10:00', duration:'2h', fee:'免费', lat:25.8560, lng:100.1190 },
      { name:'白族美食', cat:'美食', time:'12:00', duration:'1h', fee:'¥60', lat:25.6900, lng:100.1600 },
      { name:'双廊古镇', cat:'景点', time:'15:00', duration:'2h', fee:'免费', lat:25.8900, lng:100.2300 },
    ],
    '韩国首尔': [
      { name:'景福宫', cat:'景点', time:'09:00', duration:'2h', fee:'₩3,000', lat:37.5796, lng:126.9770 },
      { name:'明洞', cat:'购物', time:'14:00', duration:'3h', fee:'免费', lat:37.5609, lng:126.9865 },
      { name:'南山塔', cat:'景点', time:'17:00', duration:'1.5h', fee:'₩16,000', lat:37.5512, lng:126.9882 },
      { name:'弘大', cat:'购物', time:'19:00', duration:'2h', fee:'免费', lat:37.5563, lng:126.9236 },
      { name:'韩牛烤肉', cat:'美食', time:'12:00', duration:'1h', fee:'₩30,000', lat:37.5600, lng:126.9800 },
      { name:'北村韩屋村', cat:'景点', time:'10:30', duration:'1.5h', fee:'免费', lat:37.5826, lng:126.9850 },
      { name:'梨泰院', cat:'咖啡', time:'15:00', duration:'1h', fee:'₩6,000', lat:37.5340, lng:126.9940 },
    ],
    '泰国曼谷': [
      { name:'大皇宫', cat:'景点', time:'08:30', duration:'2h', fee:'฿500', lat:13.7500, lng:100.4917 },
      { name:'卧佛寺', cat:'景点', time:'10:30', duration:'1h', fee:'฿200', lat:13.7465, lng:100.4930 },
      { name:'考山路', cat:'购物', time:'15:00', duration:'2h', fee:'免费', lat:13.7588, lng:100.4974 },
      { name:'乍都乍周末市场', cat:'购物', time:'09:00', duration:'3h', fee:'免费', lat:13.8000, lng:100.5517 },
      { name:'泰式炒河粉', cat:'美食', time:'12:00', duration:'0.5h', fee:'฿80', lat:13.7500, lng:100.5000 },
      { name:'暹罗广场', cat:'购物', time:'14:00', duration:'2h', fee:'免费', lat:13.7462, lng:100.5341 },
      { name:'郑王庙', cat:'景点', time:'16:00', duration:'1h', fee:'฿100', lat:13.7437, lng:100.4888 },
      { name:'唐人街', cat:'美食', time:'18:00', duration:'1.5h', fee:'฿200', lat:13.7400, lng:100.5100 },
    ]
  };

  // Smart match: try exact match first, then partial match
  let places = placesDb[destination];
  if (!places) {
    const key = Object.keys(placesDb).find(k => destination.includes(k.replace(/^(日本|韩国|泰国|四川|云南)/,'')) || k.includes(destination));
    places = placesDb[key] || placesDb['日本东京'];
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
    days.push({
      id: genId(),
      date: new Date(new Date(startDate).getTime() + d*86400000).toISOString().split('T')[0],
      weather: weathers[d % weathers.length],
      tip: tips[d % tips.length],
      places: dayPlaces
    });
  }

  var budgetPerDay = budget ? Math.round(budget / numDays) : 800;
  var totalBudget = (budget || 5000) * (members || 1);

  return {
    name: destination + '之旅',
    destination,
    startDate,
    endDate: new Date(new Date(startDate).getTime() + (numDays-1)*86400000).toISOString().split('T')[0],
    days: days,
    members,
    budget,
    preferences,
    estimatedBudget: members * (budget || 5000),
    emoji: '🌏',
    readiness: 30
  };
}

/* Supabase AI (embedded) */
var SUPABASE_URL='https://vddipatvlyvciolwabqh.supabase.co';
var SUPABASE_KEY='sb_publishable_4ogDVBGxhuJTZrRb0RtuPg_6e77MnA8';
async function callAITripPlan(p){try{var r=await fetch(SUPABASE_URL+'/functions/v1/ai-plan-trip',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+SUPABASE_KEY},body:JSON.stringify(p)});var d=await r.json();if(!r.ok)throw new Error(d.error);return d}catch(e){console.warn('AI:',e.message);return null}}
async function callAIJournal(d){try{var r=await fetch(SUPABASE_URL+'/functions/v1/ai-journal',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+SUPABASE_KEY},body:JSON.stringify(d)});return await r.json()}catch(e){console.warn('AI:',e.message);return null}}
