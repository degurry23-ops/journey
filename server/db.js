/* Journey — JSON File Database
   Simple atomic JSON storage — zero native dependencies */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

// In-memory store
let data = { trips: [], days: [], places: [], expenses: [], photos: [] };

// Load from disk
function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      data = JSON.parse(raw);
      // Ensure all collections exist
      ['trips', 'days', 'places', 'expenses', 'photos'].forEach(k => {
        if (!data[k]) data[k] = [];
      });
    }
  } catch (e) {
    console.warn('DB load error, starting fresh:', e.message);
    data = { trips: [], days: [], places: [], expenses: [], photos: [] };
  }
}

// Save to disk (atomic write)
function save() {
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, DB_PATH);
}

// Initialize
load();

// ── Helpers ──
function genId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

// ── Database API (mimics SQL operations) ──
const db = {
  // Query helpers
  trips: {
    all: () => [...data.trips],
    get: (id) => data.trips.find(t => t.id === id) || null,
    insert: (trip) => { data.trips.push(trip); save(); return trip; },
    update: (id, updates) => {
      const idx = data.trips.findIndex(t => t.id === id);
      if (idx === -1) return null;
      data.trips[idx] = { ...data.trips[idx], ...updates, updated: new Date().toISOString() };
      save();
      return data.trips[idx];
    },
    delete: (id) => {
      // Cascade delete
      const dayIds = data.days.filter(d => d.trip_id === id).map(d => d.id);
      data.places = data.places.filter(p => !dayIds.includes(p.day_id));
      data.days = data.days.filter(d => d.trip_id !== id);
      data.expenses = data.expenses.filter(e => e.trip_id !== id);
      data.photos = data.photos.filter(p => p.trip_id !== id);
      data.trips = data.trips.filter(t => t.id !== id);
      save();
    }
  },

  days: {
    byTrip: (tripId) => data.days.filter(d => d.trip_id === tripId).sort((a, b) => a.sort_order - b.sort_order),
    get: (id) => data.days.find(d => d.id === id) || null,
    count: (tripId) => data.days.filter(d => d.trip_id === tripId).length,
    insert: (day) => { data.days.push(day); save(); return day; },
    delete: (id) => {
      data.places = data.places.filter(p => p.day_id !== id);
      data.days = data.days.filter(d => d.id !== id);
      save();
    }
  },

  places: {
    byDay: (dayId) => data.places.filter(p => p.day_id === dayId).sort((a, b) => a.sort_order - b.sort_order),
    count: (dayId) => data.places.filter(p => p.day_id === dayId).length,
    insert: (place) => { data.places.push(place); save(); return place; },
    delete: (id) => { data.places = data.places.filter(p => p.id !== id); save(); }
  },

  expenses: {
    byTrip: (tripId) => data.expenses.filter(e => e.trip_id === tripId).sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    get: (id) => data.expenses.find(e => e.id === id) || null,
    insert: (expense) => { data.expenses.push(expense); save(); return expense; },
    delete: (id) => { data.expenses = data.expenses.filter(e => e.id !== id); save(); }
  },

  photos: {
    byTrip: (tripId) => data.photos.filter(p => p.trip_id === tripId).sort((a, b) => (b.created || '').localeCompare(a.created || '')),
    insert: (photo) => { data.photos.push(photo); save(); return photo; },
    delete: (id) => { data.photos = data.photos.filter(p => p.id !== id); save(); }
  }
};

module.exports = { db, genId, DB_PATH };
