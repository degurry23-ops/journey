/* Journey — Seed Database with Sample Data */

const { db } = require('./db');

// Clear existing data
db.trips.all().forEach(t => db.trips.delete(t.id));

const SAMPLE_TRIPS = [
  {
    id: 'sample-1', name: '东京之旅', destination: '日本东京',
    startDate: '2026-08-02', endDate: '2026-08-08', members: 4,
    status: 'planning', readiness: 65, emoji: '🇯🇵',
    tags: '["东京","文化","美食","购物","镰仓"]', summary: '',
    days: [
      { id:'d1-1', date:'2026-08-02', weather:'☀️ 晴 25°C', tip:'今天预计步行 16km，下午可能下雨，建议带伞',
        places:[
          { id:'p1-1', name:'浅草寺', category:'景点', time:'09:00', duration:'1.5h', fee:'免费', lat:35.7148, lng:139.7967 },
          { id:'p1-2', name:'晴空塔', category:'景点', time:'11:00', duration:'1.5h', fee:'¥2,100', lat:35.7101, lng:139.8107 },
          { id:'p1-3', name:'秋叶原', category:'购物', time:'13:00', duration:'3h', fee:'--', lat:35.7023, lng:139.7745 }
        ]
      },
      { id:'d1-2', date:'2026-08-03', weather:'⛅ 多云 22°C', tip:'筑地市场早上去最新鲜，8点前到',
        places:[
          { id:'p1-4', name:'筑地市场', category:'美食', time:'08:00', duration:'1h', fee:'¥2,000', lat:35.6654, lng:139.7707 },
          { id:'p1-5', name:'银座', category:'购物', time:'10:00', duration:'2h', fee:'--', lat:35.6722, lng:139.7718 },
          { id:'p1-6', name:'涩谷', category:'购物', time:'14:00', duration:'2h', fee:'--', lat:35.6580, lng:139.7016 }
        ]
      },
      { id:'d1-3', date:'2026-08-04', weather:'☀️ 晴 28°C', tip:'明治神宫早上去人少，适合拍照',
        places:[
          { id:'p1-7', name:'明治神宫', category:'景点', time:'09:00', duration:'1h', fee:'免费', lat:35.6764, lng:139.6993 },
          { id:'p1-8', name:'新宿御苑', category:'景点', time:'10:30', duration:'1.5h', fee:'¥500', lat:35.6852, lng:139.7100 }
        ]
      },
      { id:'d1-4', date:'2026-08-05', weather:'🌧 小雨 18°C', tip:'下雨天适合逛博物馆和室内景点',
        places:[{ id:'p1-9', name:'迪士尼海洋', category:'景点', time:'09:00', duration:'全天', fee:'¥8,900', lat:35.6274, lng:139.8863 }]
      },
      { id:'d1-5', date:'2026-08-06', weather:'☁️ 阴 20°C', tip:'teamLab要提前预约，建议买早场票',
        places:[
          { id:'p1-10', name:'teamLab Borderless', category:'景点', time:'10:00', duration:'2h', fee:'¥3,200', lat:35.6264, lng:139.7817 },
          { id:'p1-11', name:'台场', category:'购物', time:'13:00', duration:'3h', fee:'--', lat:35.6257, lng:139.7756 },
          { id:'p1-12', name:'大江户温泉', category:'景点', time:'17:00', duration:'2h', fee:'¥2,480', lat:35.6250, lng:139.7800 }
        ]
      },
      { id:'d1-6', date:'2026-08-07', weather:'☀️ 晴 27°C', tip:'镰仓一天足够，坐江之电最方便',
        places:[
          { id:'p1-13', name:'镰仓大佛', category:'景点', time:'09:30', duration:'1h', fee:'¥300', lat:35.3169, lng:139.5357 },
          { id:'p1-14', name:'江之岛', category:'景点', time:'11:00', duration:'3h', fee:'免费', lat:35.3003, lng:139.4810 },
          { id:'p1-15', name:'镰仓高校前站', category:'景点', time:'15:00', duration:'0.5h', fee:'免费', lat:35.3046, lng:139.4994 }
        ]
      },
      { id:'d1-7', date:'2026-08-08', weather:'⛅ 多云 23°C', tip:'最后一天轻松逛，留时间去机场',
        places:[
          { id:'p1-16', name:'Blue Bottle Coffee', category:'咖啡', time:'09:00', duration:'0.5h', fee:'¥550', lat:35.7100, lng:139.8100 },
          { id:'p1-17', name:'上野公园', category:'景点', time:'10:30', duration:'1.5h', fee:'免费', lat:35.7146, lng:139.7732 },
          { id:'p1-18', name:'阿美横丁', category:'购物', time:'13:00', duration:'1.5h', fee:'--', lat:35.7100, lng:139.7750 }
        ]
      }
    ],
    expenses: [
      { id:'e1-1', category:'餐饮', amount:980, note:'一兰拉面', payer:'我', date:'2026-08-02', dayId:'d1-1' },
      { id:'e1-2', category:'交通', amount:500, note:'Suica充值', payer:'小月', date:'2026-08-02', dayId:'d1-1' },
      { id:'e1-3', category:'门票', amount:2100, note:'晴空塔', payer:'小林', date:'2026-08-02', dayId:'d1-1' },
      { id:'e1-4', category:'门票', amount:8900, note:'迪士尼海洋', payer:'我', date:'2026-08-05', dayId:'d1-4' },
      { id:'e1-5', category:'门票', amount:3200, note:'teamLab', payer:'阿明', date:'2026-08-06', dayId:'d1-5' },
      { id:'e1-6', category:'交通', amount:1500, note:'镰仓江之电一日券', payer:'小月', date:'2026-08-07', dayId:'d1-6' }
    ]
  },
  {
        id: 'sample-2', name: '成都之旅', destination: '四川成都',
    startDate: '2026-07-18', endDate: '2026-07-22', members: 4,
    status: 'traveling', readiness: 85, emoji: '🐼',
    tags: '["成都","美食","熊猫","休闲"]', summary: '',
    days: [
      { id:'d2-1', date:'2026-07-18', weather:'☀️ 晴 32°C', tip:'成都夏天热，记得多喝水',
        places:[
          { id:'p2-1', name:'大熊猫基地', category:'景点', time:'08:30', duration:'3h', fee:'¥55', lat:30.7290, lng:104.1435 },
          { id:'p2-2', name:'宽窄巷子', category:'景点', time:'12:00', duration:'1.5h', fee:'免费', lat:30.6697, lng:104.0596 },
          { id:'p2-3', name:'锦里', category:'美食', time:'14:00', duration:'2h', fee:'--', lat:30.6478, lng:104.0539 }
        ]
      },
      { id:'d2-2', date:'2026-07-19', weather:'⛅ 多云 30°C', tip:'武侯祠和锦里很近，可以一起逛',
        places:[
          { id:'p2-4', name:'武侯祠', category:'景点', time:'09:00', duration:'1h', fee:'¥50', lat:30.6480, lng:104.0493 },
          { id:'p2-5', name:'春熙路', category:'购物', time:'14:00', duration:'2h', fee:'--', lat:30.6562, lng:104.0815 },
          { id:'p2-6', name:'蜀大侠火锅', category:'美食', time:'18:00', duration:'1h', fee:'¥120', lat:30.6500, lng:104.0600 }
        ]
      },
      { id:'d2-3', date:'2026-07-20', weather:'🌧 小雨 26°C', tip:'下雨天适合逛博物馆，人民公园喝茶听雨',
        places:[
          { id:'p2-7', name:'四川博物院', category:'景点', time:'09:30', duration:'2h', fee:'免费', lat:30.6620, lng:104.0340 },
          { id:'p2-8', name:'人民公园', category:'景点', time:'14:00', duration:'1.5h', fee:'免费', lat:30.6596, lng:104.0570 },
          { id:'p2-9', name:'鹤鸣茶社', category:'咖啡', time:'15:30', duration:'1h', fee:'¥30', lat:30.6598, lng:104.0575 }
        ]
      },
      { id:'d2-4', date:'2026-07-21', weather:'☀️ 晴 31°C', tip:'青城山建议坐索道上山，节省体力',
        places:[
          { id:'p2-10', name:'青城山', category:'景点', time:'08:00', duration:'5h', fee:'¥90', lat:30.8990, lng:103.5680 },
          { id:'p2-11', name:'都江堰', category:'景点', time:'14:00', duration:'2h', fee:'¥80', lat:31.0022, lng:103.6222 }
        ]
      },
      { id:'d2-5', date:'2026-07-22', weather:'⛅ 多云 28°C', tip:'最后一天买点特产，兔头必带',
        places:[
          { id:'p2-12', name:'九眼桥', category:'景点', time:'10:00', duration:'1h', fee:'免费', lat:30.6453, lng:104.0819 },
          { id:'p2-13', name:'太古里', category:'购物', time:'13:00', duration:'2h', fee:'--', lat:30.6520, lng:104.0830 }
        ]
      }
    ],
    expenses: [
      { id:'e2-1', category:'餐饮', amount:450, note:'火锅', payer:'我', date:'2026-07-18', dayId:'d2-1' },
      { id:'e2-2', category:'门票', amount:55, note:'熊猫基地', payer:'阿明', date:'2026-07-18', dayId:'d2-1' },
      { id:'e2-3', category:'餐饮', amount:120, note:'蜀大侠火锅', payer:'小林', date:'2026-07-19', dayId:'d2-2' },
      { id:'e2-4', category:'门票', amount:170, note:'青城山+都江堰', payer:'我', date:'2026-07-21', dayId:'d2-4' },
      { id:'e2-5', category:'交通', amount:300, note:'租车', payer:'阿明', date:'2026-07-21', dayId:'d2-4' }
    ]
  },
  {
    id: 'sample-3', name: '上海之旅', destination: '上海',
    startDate: '2026-05-10', endDate: '2026-05-13', members: 2,
    status: 'completed', readiness: 100, emoji: '🌆',
    tags: '["上海","都市","美食","浪漫"]',
    summary: '上海是一座永远充满活力的城市。外滩的万国建筑群在黄昏时分格外迷人，对岸陆家嘴的摩天大楼闪烁着未来的光芒。',
    days: [
      { id:'d3-1', date:'2026-05-10', weather:'☀️ 晴 26°C', tip:'外滩夜景必看，建议黄昏时分到达',
        places:[
          { id:'p3-1', name:'外滩', category:'景点', time:'18:00', duration:'1.5h', fee:'免费', lat:31.2400, lng:121.4906 },
          { id:'p3-2', name:'南京路步行街', category:'购物', time:'14:00', duration:'2h', fee:'--', lat:31.2363, lng:121.4802 },
          { id:'p3-3', name:'和平饭店', category:'景点', time:'20:00', duration:'0.5h', fee:'免费', lat:31.2415, lng:121.4910 }
        ]
      },
      { id:'d3-2', date:'2026-05-11', weather:'⛅ 多云 24°C', tip:'豫园早上人少，建议9点前到',
        places:[
          { id:'p3-4', name:'豫园', category:'景点', time:'09:00', duration:'2h', fee:'¥40', lat:31.2290, lng:121.4924 },
          { id:'p3-5', name:'新天地', category:'咖啡', time:'13:00', duration:'1.5h', fee:'¥60', lat:31.2194, lng:121.4753 },
          { id:'p3-6', name:'田子坊', category:'购物', time:'15:30', duration:'1.5h', fee:'免费', lat:31.2098, lng:121.4692 }
        ]
      },
      { id:'d3-3', date:'2026-05-12', weather:'☀️ 晴 28°C', tip:'迪士尼全天游玩，记得提前下载APP预约项目',
        places:[
          { id:'p3-7', name:'迪士尼乐园', category:'景点', time:'09:00', duration:'全天', fee:'¥475', lat:31.1440, lng:121.6600 }
        ]
      },
      { id:'d3-4', date:'2026-05-13', weather:'☁️ 阴 22°C', tip:'最后一天轻松逛，武康路适合拍照',
        places:[
          { id:'p3-8', name:'武康路', category:'景点', time:'10:00', duration:'1.5h', fee:'免费', lat:31.2076, lng:121.4416 },
          { id:'p3-9', name:'小笼包', category:'美食', time:'12:00', duration:'0.5h', fee:'¥40', lat:31.2300, lng:121.4800 }
        ]
      }
    ],
    expenses: [
      { id:'e3-1', category:'餐饮', amount:380, note:'小笼包', payer:'我', date:'2026-05-10', dayId:'d3-1' },
      { id:'e3-2', category:'门票', amount:40, note:'豫园', payer:'我', date:'2026-05-11', dayId:'d3-2' },
      { id:'e3-3', category:'门票', amount:475, note:'迪士尼', payer:'我', date:'2026-05-12', dayId:'d3-3' },
      { id:'e3-4', category:'交通', amount:200, note:'地铁+打车', payer:'小月', date:'2026-05-12', dayId:'d3-3' }
    ]
  },
  {
    id: 'sample-4', name: '大理之旅', destination: '云南大理',
    startDate: '2026-03-05', endDate: '2026-03-07', members: 2,
    status: 'completed', readiness: 100, emoji: '🏔️',
    tags: '["大理","洱海","古城","骑行"]',
    summary: '大理的慢时光让人忘记城市的喧嚣。洱海骑行是此行最难忘的体验。',
    days: [
      { id:'d4-1', date:'2026-03-05', weather:'☀️ 晴 22°C', tip:'洱海骑行是最佳体验，建议租电动车',
        places:[
          { id:'p4-1', name:'洱海', category:'景点', time:'09:00', duration:'4h', fee:'免费', lat:25.6064, lng:100.2329 },
          { id:'p4-2', name:'大理古城', category:'景点', time:'14:00', duration:'3h', fee:'免费', lat:25.6891, lng:100.1615 }
        ]
      },
      { id:'d4-2', date:'2026-03-06', weather:'⛅ 多云 18°C', tip:'苍山索道上午去，下午风大可能停运',
        places:[
          { id:'p4-3', name:'苍山', category:'景点', time:'08:00', duration:'5h', fee:'¥40', lat:25.6570, lng:100.1080 },
          { id:'p4-4', name:'喜洲古镇', category:'景点', time:'14:00', duration:'2h', fee:'免费', lat:25.8560, lng:100.1190 }
        ]
      },
      { id:'d4-3', date:'2026-03-07', weather:'☀️ 晴 20°C', tip:'双廊适合发呆看日落，慢慢逛',
        places:[
          { id:'p4-5', name:'双廊古镇', category:'景点', time:'10:00', duration:'2h', fee:'免费', lat:25.8900, lng:100.2300 },
          { id:'p4-6', name:'白族美食', category:'美食', time:'12:30', duration:'1h', fee:'¥60', lat:25.6900, lng:100.1600 }
        ]
      }
    ],
    expenses: [
      { id:'e4-1', category:'餐饮', amount:220, note:'白族美食', payer:'我', date:'2026-03-05', dayId:'d4-1' },
      { id:'e4-2', category:'门票', amount:40, note:'苍山索道', payer:'我', date:'2026-03-06', dayId:'d4-2' },
      { id:'e4-3', category:'交通', amount:150, note:'电动车租赁', payer:'小月', date:'2026-03-05', dayId:'d4-1' }
    ]
  }
];

// Insert data
SAMPLE_TRIPS.forEach(trip => {
  db.trips.insert({
    id: trip.id, name: trip.name, destination: trip.destination,
    start_date: trip.startDate, end_date: trip.endDate, members: trip.members,
    status: trip.status, readiness: trip.readiness, emoji: trip.emoji,
    summary: trip.summary, tags: trip.tags, budget: '', preferences: '',
    created: new Date().toISOString(), updated: new Date().toISOString()
  });
  trip.days.forEach((day, di) => {
    db.days.insert({ id: day.id, trip_id: trip.id, date: day.date, weather: day.weather, tip: day.tip, sort_order: di });
    day.places.forEach((place, pi) => {
      db.places.insert({ id: place.id, day_id: day.id, name: place.name, category: place.category, time: place.time, duration: place.duration, fee: place.fee, lat: place.lat, lng: place.lng, sort_order: pi });
    });
  });
  (trip.expenses || []).forEach(exp => {
    db.expenses.insert({ id: exp.id, trip_id: trip.id, category: exp.category, amount: exp.amount, note: exp.note, payer: exp.payer, date: exp.date, day_id: exp.dayId });
  });
});

console.log('Sample data seeded: ' + SAMPLE_TRIPS.length + ' trips');
