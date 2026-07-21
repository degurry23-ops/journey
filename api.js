/* Journey — API Client
   Bridge between frontend and Express backend.
   Drop-in: replaces localStorage CRUD with API calls while keeping sync-compatible surface. */

var API_BASE = window.location.origin.replace(':8080', ':3001').replace(':3000', ':3001');
// If origin doesn't have a port, add 3001
if (!API_BASE.match(/:\d+/)) API_BASE += ':3001';

var API = {
  // ── Trips ──
  listTrips: async function () {
    var r = await fetch(API_BASE + '/api/trips');
    if (!r.ok) throw new Error('Failed to load trips');
    var trips = await r.json();
    // Normalize field names (snake_case -> camelCase for compat)
    return trips.map(API._normalizeTrip);
  },

  getTrip: async function (id) {
    var r = await fetch(API_BASE + '/api/trips/' + id);
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('Failed to load trip');
    var trip = await r.json();
    return API._normalizeTrip(trip);
  },

  createTrip: async function (trip) {
    var r = await fetch(API_BASE + '/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip)
    });
    if (!r.ok) throw new Error('Failed to create trip');
    return API._normalizeTrip(await r.json());
  },

  updateTrip: async function (id, updates) {
    var r = await fetch(API_BASE + '/api/trips/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!r.ok) throw new Error('Failed to update trip');
    return API._normalizeTrip(await r.json());
  },

  deleteTrip: async function (id) {
    var r = await fetch(API_BASE + '/api/trips/' + id, { method: 'DELETE' });
    if (!r.ok) throw new Error('Failed to delete trip');
  },

  // ── Expenses ──
  getExpenses: async function (tripId) {
    var r = await fetch(API_BASE + '/api/trips/' + tripId + '/expenses');
    if (!r.ok) throw new Error('Failed to load expenses');
    return await r.json();
  },

  addExpense: async function (tripId, expense) {
    var r = await fetch(API_BASE + '/api/trips/' + tripId + '/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    if (!r.ok) throw new Error('Failed to add expense');
    return await r.json();
  },

  deleteExpense: async function (tripId, expenseId) {
    await fetch(API_BASE + '/api/trips/' + tripId + '/expenses/' + expenseId, { method: 'DELETE' });
  },

  // ── Photos ──
  getPhotos: async function (tripId) {
    var r = await fetch(API_BASE + '/api/trips/' + tripId + '/photos');
    if (!r.ok) return [];
    return await r.json();
  },

  addPhoto: async function (tripId, dataUrl) {
    var r = await fetch(API_BASE + '/api/trips/' + tripId + '/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl: dataUrl })
    });
    if (!r.ok) throw new Error('Failed to add photo');
    return await r.json();
  },

  deletePhoto: async function (tripId, photoId) {
    await fetch(API_BASE + '/api/trips/' + tripId + '/photos/' + photoId, { method: 'DELETE' });
  },

  // ── AI ──
  planTrip: async function (params) {
    var r = await fetch(API_BASE + '/api/ai/plan-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!r.ok) throw new Error('AI plan failed');
    return await r.json();
  },

  generateJournal: async function (data) {
    var r = await fetch(API_BASE + '/api/ai/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('AI journal failed');
    return await r.json();
  },

  // ── Helpers ──
  _normalizeTrip: function (t) {
    // Convert snake_case fields to camelCase for backward compatibility
    return {
      id: t.id,
      name: t.name,
      destination: t.destination,
      startDate: t.start_date || t.startDate,
      endDate: t.end_date || t.endDate,
      days: (t.days || []).map(function (d) { return API._normalizeDay(d); }),
      members: t.members || 1,
      status: t.status || 'planning',
      readiness: t.readiness || 0,
      emoji: t.emoji || '🌏',
      budget: t.budget || '',
      preferences: t.preferences || '',
      summary: t.summary || '',
      tags: t.tags || [],
      highlights: t.tags || [],
      expenses: (t.expenses || []).map(function (e) { return API._normalizeExpense(e); }),
      photos: t.photos || [],
      created: t.created,
      updated: t.updated
    };
  },

  _normalizeDay: function (d) {
    return {
      id: d.id,
      date: d.date,
      weather: d.weather || '☀️ 晴',
      tip: d.tip || '',
      places: (d.places || []).map(function (p) { return API._normalizePlace(p); })
    };
  },

  _normalizePlace: function (p) {
    return {
      id: p.id,
      name: p.name,
      cat: p.category || p.cat || '景点',
      category: p.category || p.cat || '景点',
      time: p.time || '09:00',
      duration: p.duration || '1h',
      fee: p.fee || '免费',
      lat: p.lat,
      lng: p.lng
    };
  },

  _normalizeExpense: function (e) {
    return {
      id: e.id,
      cat: e.category || e.cat || '餐饮',
      category: e.category || e.cat || '餐饮',
      amount: e.amount || 0,
      note: e.note || '',
      payer: e.payer || '我',
      date: e.date || '',
      dayId: e.day_id || e.dayId || ''
    };
  }
};
