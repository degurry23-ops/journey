/* Journey — Trips API Routes */

const express = require('express');
const router = express.Router();
const { db, genId } = require('../db');

// GET /api/trips — list all trips
router.get('/', (req, res) => {
  const trips = db.trips.all().map(t => tripWithDays(t));
  res.json(trips);
});

// GET /api/trips/:id — get single trip with full details
router.get('/:id', (req, res) => {
  const trip = db.trips.get(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const full = tripWithDays(trip);
  full.expenses = db.expenses.byTrip(req.params.id);
  full.photos = db.photos.byTrip(req.params.id);
  full.tags = typeof full.tags === 'string' ? JSON.parse(full.tags) : (full.tags || []);
  res.json(full);
});

// POST /api/trips — create new trip
router.post('/', (req, res) => {
  const { name, destination, startDate, endDate, days, members, emoji, budget, preferences } = req.body;
  const id = genId();
  const trip = {
    id,
    name: name || (destination ? destination + '之旅' : '新旅行'),
    destination: destination || '',
    start_date: startDate || '',
    end_date: endDate || '',
    members: members || 1,
    status: 'planning',
    readiness: 30,
    emoji: emoji || '🌏',
    budget: budget || '',
    preferences: preferences || '',
    summary: '',
    tags: '[]',
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  };
  db.trips.insert(trip);

  if (days && Array.isArray(days)) {
    days.forEach((d, di) => {
      const dayId = genId();
      db.days.insert({ id: dayId, trip_id: id, date: d.date || '', weather: d.weather || '☀️ 晴 25°C', tip: d.tip || '', sort_order: di });
      if (d.places && Array.isArray(d.places)) {
        d.places.forEach((p, pi) => {
          db.places.insert({ id: genId(), day_id: dayId, name: p.name, category: p.cat || p.category || '景点', time: p.time || '09:00', duration: p.duration || '1h', fee: p.fee || '免费', lat: p.lat || null, lng: p.lng || null, sort_order: pi });
        });
      }
    });
  }

  res.status(201).json(tripWithDays(db.trips.get(id)));
});

// PUT /api/trips/:id — update trip
router.put('/:id', (req, res) => {
  const trip = db.trips.get(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const fields = ['name','destination','start_date','end_date','members','status','readiness','emoji','budget','preferences','summary','tags'];
  const updates = {};
  fields.forEach(f => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (Object.keys(updates).length === 0) return res.json(tripWithDays(trip));

  const updated = db.trips.update(req.params.id, updates);
  res.json(tripWithDays(updated));
});

// DELETE /api/trips/:id
router.delete('/:id', (req, res) => {
  if (!db.trips.get(req.params.id)) return res.status(404).json({ error: 'Trip not found' });
  db.trips.delete(req.params.id);
  res.json({ success: true });
});

// ── Day Routes ──
router.get('/:tripId/days', (req, res) => {
  const days = db.days.byTrip(req.params.tripId).map(d => ({
    ...d,
    places: db.places.byDay(d.id)
  }));
  res.json(days);
});

router.post('/:tripId/days', (req, res) => {
  if (!db.trips.get(req.params.tripId)) return res.status(404).json({ error: 'Trip not found' });
  const count = db.days.count(req.params.tripId);
  const id = genId();
  const day = { id, trip_id: req.params.tripId, date: req.body.date || '', weather: req.body.weather || '☀️ 晴 25°C', tip: req.body.tip || '', sort_order: count };
  db.days.insert(day);
  res.status(201).json(day);
});

// ── Place Routes ──
router.post('/:tripId/days/:dayId/places', (req, res) => {
  const day = db.days.get(req.params.dayId);
  if (!day || day.trip_id !== req.params.tripId) return res.status(404).json({ error: 'Day not found' });

  const count = db.places.count(req.params.dayId);
  const id = genId();
  const place = { id, day_id: req.params.dayId, name: req.body.name, category: req.body.category || '景点', time: req.body.time || '09:00', duration: req.body.duration || '1h', fee: req.body.fee || '免费', lat: req.body.lat || null, lng: req.body.lng || null, sort_order: count };
  db.places.insert(place);
  res.status(201).json(place);
});

router.delete('/:tripId/days/:dayId/places/:placeId', (req, res) => {
  db.places.delete(req.params.placeId);
  res.json({ success: true });
});

// ── Helper ──
function tripWithDays(trip) {
  if (!trip) return null;
  const days = db.days.byTrip(trip.id).map(d => ({
    ...d,
    places: db.places.byDay(d.id)
  }));
  return {
    ...trip,
    tags: typeof trip.tags === 'string' ? JSON.parse(trip.tags || '[]') : (trip.tags || []),
    days
  };
}

module.exports = router;
