# Journey — AI 旅行手帐

> AI 驱动的旅行规划与记录。一个 App，完成整段旅程。

[![Deploy](https://img.shields.io/badge/Live-journey--nwot.onrender.com-blue)](https://journey-nwot.onrender.com)

---

## 产品闭环

```
AI 创建旅行 → 编辑行程 → 出发前准备 → Today 每日旅程 → 旅行日志/分享卡片
```

---

## 功能

| 页面 | 说明 |
|------|------|
| 🏠 **首页** | AI 旅行伙伴 Hero + 下一段旅程 + 进行中卡片 + 旅行足迹 + 记忆卡片 |
| ✨ **AI 创建** | 卡片式向导 6 步 → DeepSeek/OpenAI/Claude 真 AI 生成 → 可编辑确认 |
| 📋 **行程详情** | 动态准备度 + 同行伙伴 + 行李清单 + 每日路线 |
| 📅 **Today** | 时段问候 + 天气 + 路线时间轴 + 预算进度 + AI 提醒 + 快捷拍照 |
| 🗺 **地图** | Leaflet 动态 Day 筛选 + 颜色标记 + Polyline 路线连线 |
| 💰 **记账** | 分类统计 + AA 分摊 + 预算预警 + 多币种换算 |
| 📖 **日志** | 每日回顾 + AI 总结 + ECharts 饼图 + 照片墙 + 行程分享卡片 |
| ⚙️ **设置** | 用户昵称 + API Key + 数据导出/导入/清空 |

---

## 技术架构

```
前端 (HTML/CSS/JS)         后端 (Node.js Express)        AI
┌──────────────────┐       ┌──────────────────┐       ┌──────────┐
│ 9 个页面          │  API  │ REST API          │       │ DeepSeek │
│ localStorage 缓存 │ ←───→ │ JSON 文件数据库    │  ←──  │ OpenAI   │
│ API Bridge 同步   │       │ IP 限流 (20次/天) │       │ Claude   │
└──────────────────┘       └──────────────────┘       └──────────┘
```

- **前端**: 纯 HTML/CSS/JS，无框架，零构建
- **后端**: Express + JSON 原子写入（零依赖数据库）
- **AI**: 支持 DeepSeek / OpenAI / Claude / Mock 四模式
- **地图**: Leaflet + OpenStreetMap
- **图表**: ECharts
- **部署**: Docker → Render / Railway / 任意云平台

---

## 本地运行

```bash
cd server
npm install
npm run seed        # 初始化示例数据
npm start           # http://localhost:3001
```

---

## 环境变量

| Key | 默认值 | 说明 |
|-----|--------|------|
| `PORT` | `3001` | 服务端口 |
| `AI_PROVIDER` | `mock` | `openai` / `claude` / `mock` |
| `AI_API_KEY` | - | AI API Key |
| `AI_MODEL` | `deepseek-chat` | 模型名称 |
| `AI_BASE_URL` | `https://api.deepseek.com/v1` | API 地址 |
| `AI_DAILY_LIMIT` | `20` | 每 IP 每日 AI 次数 |
| `AI_MAX_TOKENS` | `1500` | 每次最大 Token |

---

## 项目结构

```
├── index.html              # 首页
├── journeys.html           # 旅行列表
├── create.html             # AI 创建旅行
├── trip-detail.html        # 行程详情（控制中心）
├── today.html              # Today 今日旅程
├── day-timeline.html       # 日程编辑
├── map.html                # 地图模式
├── journal.html            # 旅行日志
├── expenses.html           # 旅行记账
├── settings.html           # 设置
├── styles.css              # 全局样式
├── storage.js              # 数据层 (localStorage + API)
├── utils.js                # 工具函数
├── api.js                  # API 客户端
├── api-bridge.js           # localStorage ↔ API 同步桥
├── components/
│   └── header.js           # 共享导航（含用户登录入口）
├── pages/
│   ├── home.js             # 首页逻辑
│   ├── journeys.js         # 旅行列表逻辑
│   ├── create.js           # AI 创建向导
│   ├── trip-detail.js      # 行程详情逻辑
│   ├── today.js            # Today 页逻辑
│   ├── timeline.js         # 日程编辑逻辑
│   ├── map.js              # 地图逻辑
│   ├── journal.js          # 日志逻辑
│   ├── expenses.js         # 记账逻辑
│   └── settings.js         # 设置逻辑
├── server/
│   ├── index.js            # Express 入口
│   ├── db.js               # JSON 数据库
│   ├── seed.js             # 示例数据
│   ├── .env                # 环境变量
│   └── routes/
│       ├── trips.js        # 行程 CRUD API
│       ├── expenses.js     # 记账 API
│       ├── photos.js       # 照片 API
│       └── ai.js           # AI 生成 + 限流
└── Dockerfile              # 容器化部署
```

---

## 示例数据

| 旅行 | 日期 | 天数 | 状态 |
|------|------|------|------|
| 🇯🇵 东京之旅 | 2026-08-02 ~ 08-08 | 7天 | 计划中 |
| 🐼 成都之旅 | 2026-07-18 ~ 07-22 | 5天 | 进行中 |
| 🌆 上海之旅 | 2026-05-10 ~ 05-13 | 4天 | 已完成 |
| 🏔️ 大理之旅 | 2026-03-05 ~ 03-07 | 3天 | 已完成 |

---

Made with 💙 Journey · Every Journey Deserves to Be Remembered
