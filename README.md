# Journey — AI 旅行手帐

AI 驱动的旅行规划与记录应用。一个 App，完成整段旅程。

## 功能

- 🤖 **AI 创建旅行** — 对话式 AI 帮你规划路线
- 📅 **日程时间线** — 按天查看行程，添加地点，一键导航
- 🗺️ **地图模式** — 所有打卡地点可视化，按天筛选
- 💰 **旅行记账** — 分类记录消费，AA 结算
- 📖 **旅行日志** — 自动生成旅行回顾，消费图表，照片墙
- 📊 **数据管理** — 导出/导入 JSON 备份，示例数据

## 技术

纯 HTML/CSS/JS，无需构建工具，浏览器直接打开即可使用。

- **存储**: localStorage
- **地图**: Leaflet
- **图表**: ECharts
- **AI**: Supabase Edge Functions (可选，离线时使用本地模板生成)
- **图标**: Font Awesome
- **字体**: Google Fonts (Inter, Noto Sans SC, Calistoga, JetBrains Mono)

## 使用

```bash
# 启动本地服务器
cd prototype
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```

或者直接部署到任意静态托管服务 (GitHub Pages, Vercel, Netlify 等)。

## 项目结构

```
├── index.html          # 首页
├── journeys.html       # 行程列表
├── create.html         # AI 创建旅行
├── trip-detail.html    # 行程详情
├── day-timeline.html   # 日程时间线
├── map.html            # 地图模式
├── journal.html        # 旅行日志
├── expenses.html       # 旅行记账
├── settings.html       # 设置
├── styles.css          # 全局样式
├── storage.js          # 数据层 (localStorage CRUD)
├── utils.js            # 工具函数
├── supabase-init.js    # Supabase AI 集成
├── components/
│   └── header.js       # 共享导航组件
└── pages/
    ├── home.js
    ├── journeys.js
    ├── create.js
    ├── trip-detail.js
    ├── timeline.js
    ├── map.js
    ├── journal.js
    ├── expenses.js
    └── settings.js
```

## License

Made with 💙 Journey · Every Journey Deserves to Be Remembered
