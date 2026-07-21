/* Journey — Real-time Exchange Rates (Frankfurter API, free, no key) */

const express = require('express');
const router = express.Router();

// In-memory cache: { "JPY-CNY": { rate: 0.048, updated: "2026-07-22T10:00:00Z" } }
const cache = {};
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

// Default rates (fallback when API unavailable)
const DEFAULT_RATES = {
  JPY: { CNY: 0.048, USD: 0.0067 },
  KRW: { CNY: 0.0053, USD: 0.00075 },
  THB: { CNY: 0.20, USD: 0.028 },
  USD: { CNY: 7.25, JPY: 150, KRW: 1350, THB: 35 },
  CNY: { USD: 0.138, JPY: 20.8, KRW: 188, THB: 5.0 },
  EUR: { CNY: 7.90, USD: 1.09 }
};

// GET /api/exchange-rate?from=JPY&to=CNY
router.get('/', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to required' });

  const cacheKey = from + '-' + to;

  // Return cached if fresh
  if (cache[cacheKey] && (Date.now() - cache[cacheKey].updated) < CACHE_TTL) {
    return res.json({ from, to, rate: cache[cacheKey].rate, cached: true });
  }

  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=' + from + '&to=' + to);
    const data = await r.json();
    const rate = data.rates[to];

    cache[cacheKey] = { rate, updated: Date.now() };
    res.json({ from, to, rate, updated: new Date().toISOString() });

  } catch (e) {
    // Fallback to default rates
    const fallback = (DEFAULT_RATES[from] && DEFAULT_RATES[from][to]) || 0.05;
    console.warn('Exchange rate API failed, using fallback:', from, to, fallback);
    res.json({ from, to, rate: fallback, fallback: true });
  }
});

// GET /api/exchange-rate/all?base=CNY — get all common rates at once
router.get('/all', async (req, res) => {
  const base = req.query.base || 'CNY';
  const targets = ['JPY','KRW','THB','USD','EUR'];

  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=' + base + '&to=' + targets.join(','));
    const data = await r.json();
    // Also cache individual pairs
    targets.forEach(t => {
      if (data.rates[t]) cache[base + '-' + t] = { rate: data.rates[t], updated: Date.now() };
    });
    res.json({ base, rates: data.rates, updated: new Date().toISOString() });
  } catch (e) {
    const fallbackRates = {};
    targets.forEach(t => { fallbackRates[t] = (DEFAULT_RATES[base] && DEFAULT_RATES[base][t]) || 1; });
    res.json({ base, rates: fallbackRates, fallback: true });
  }
});

module.exports = router;
