/* Journey — Weather API (Open-Meteo, free, no key) */

const express = require('express');
const router = express.Router();

// GET /api/weather?lat=35.7&lng=139.8&date=2026-08-02
router.get('/', async (req, res) => {
  const { lat, lng, date } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=auto&start_date=${targetDate}&end_date=${targetDate}`
    );
    const data = await r.json();

    if (!data.daily) return res.json({ weather: '☀️ 晴', temp: '--' });

    const code = data.daily.weathercode[0];
    const weatherMap = {
      0: '☀️ 晴', 1: '🌤 大部晴', 2: '⛅ 多云', 3: '☁️ 阴',
      45: '🌫 雾', 48: '🌫 霜雾', 51: '🌧 小雨', 53: '🌧 小雨', 55: '🌧 中雨',
      61: '🌧 雨', 63: '🌧 中雨', 65: '🌧 大雨', 71: '🌨 小雪', 73: '🌨 雪',
      75: '🌨 大雪', 77: '🌨 雪', 80: '🌧 阵雨', 81: '🌧 阵雨', 82: '🌧 暴雨',
      85: '🌨 阵雪', 86: '🌨 阵雪', 95: '⛈ 雷暴', 96: '⛈ 雷暴+冰雹', 99: '⛈ 强雷暴'
    };
    const weather = weatherMap[code] || '🌤';
    const tempMax = data.daily.temperature_2m_max[0];
    const tempMin = data.daily.temperature_2m_min[0];
    const rainProb = data.daily.precipitation_probability_max[0] || 0;

    const weatherStr = weather + ' ' + Math.round(tempMin) + '°C~' + Math.round(tempMax) + '°C';
    const tip = rainProb > 50 ? '降水概率' + rainProb + '%，建议带伞 ☂️' :
                tempMax > 35 ? '高温预警，注意防暑 💧' :
                tempMin < 5 ? '天气寒冷，注意保暖 🧣' :
                '天气不错，适合出行~';

    res.json({
      weather: weatherStr,
      temp: Math.round(tempMin) + '°C~' + Math.round(tempMax) + '°C',
      rainProb: rainProb,
      tip: tip
    });
  } catch (e) {
    res.json({ weather: '☀️ 晴 25°C', temp: '25°C', tip: '天气不错，适合出行~' });
  }
});

module.exports = router;
