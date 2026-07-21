/* Journey — API Bridge
   Syncs between localStorage (instant UI) and Express API (persistent storage).
   Pages continue using localStorage functions; mutations propagate to API automatically. */

(function () {
  var API_BASE = window.location.origin.replace(':8080', ':3001').replace(':3000', ':3001');
  if (!API_BASE.match(/:\d+/)) API_BASE += ':3001';

  // ── Init: sync from API to localStorage on first load ──
  async function syncFromAPI() {
    try {
      var r = await fetch(API_BASE + '/api/trips');
      if (!r.ok) return;
      var trips = await r.json();

      // Convert to localStorage format
      var localTrips = trips.map(function (t) {
        return {
          id: t.id, name: t.name, destination: t.destination,
          startDate: t.start_date, endDate: t.end_date,
          days: (t.days || []).map(function (d) {
            return {
              id: d.id, date: d.date, weather: d.weather, tip: d.tip,
              places: (d.places || []).map(function (p) {
                return { id: p.id, name: p.name, cat: p.category, time: p.time, duration: p.duration, fee: p.fee, lat: p.lat, lng: p.lng };
              })
            };
          }),
          members: t.members, status: t.status, readiness: t.readiness,
          emoji: t.emoji, budget: t.budget, preferences: t.preferences,
          summary: t.summary, tags: t.tags || [],
          expenses: (t.expenses || []).map(function (e) {
            return { id: e.id, cat: e.category, amount: e.amount, note: e.note, payer: e.payer, date: e.date, dayId: e.day_id };
          })
        };
      });

      // Only overwrite if API has data
      if (localTrips.length > 0) {
        localStorage.setItem('journey_proto_trips', JSON.stringify(localTrips));
      }

      // Sync photos separately
      for (var i = 0; i < trips.length; i++) {
        var t = trips[i];
        if (t.photos && t.photos.length > 0) {
          var allPhotos = {};
          try { allPhotos = JSON.parse(localStorage.getItem('journey_photos')) || {}; } catch (e) {}
          allPhotos[t.id] = t.photos.map(function (p) { return { id: p.id, dataUrl: p.data_url, date: p.created }; });
          localStorage.setItem('journey_photos', JSON.stringify(allPhotos));
        }
      }

      console.log('[API Bridge] Synced ' + localTrips.length + ' trips from API');
    } catch (e) {
      console.warn('[API Bridge] Sync failed, using localStorage:', e.message);
    }
  }

  // ── Override save functions to also write to API ──
  var _origSaveTrips = window.saveTrips;
  if (_origSaveTrips) {
    window.saveTrips = function (trips) {
      _origSaveTrips(trips);
      // Background API sync — fire and forget
      syncToAPI(trips);
    };
  }

  var _origAddTrip = window.addTrip;
  if (_origAddTrip) {
    window.addTrip = function (trip) {
      var result = _origAddTrip(trip);
      // Create on API
      fetch(API_BASE + '/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trip.name, destination: trip.destination,
          startDate: trip.startDate, endDate: trip.endDate,
          days: trip.days, members: trip.members, emoji: trip.emoji,
          budget: trip.budget, preferences: trip.preferences
        })
      }).catch(function (e) { console.warn('[API Bridge] Create trip failed:', e.message); });
      return result;
    };
  }

  var _origUpdateTrip = window.updateTrip;
  if (_origUpdateTrip) {
    window.updateTrip = function (id, updates) {
      var result = _origUpdateTrip(id, updates);
      fetch(API_BASE + '/api/trips/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).catch(function (e) { console.warn('[API Bridge] Update trip failed:', e.message); });
      return result;
    };
  }

  var _origDeleteTrip = window.deleteTrip;
  if (_origDeleteTrip) {
    window.deleteTrip = function (id) {
      _origDeleteTrip(id);
      fetch(API_BASE + '/api/trips/' + id, { method: 'DELETE' })
        .catch(function (e) { console.warn('[API Bridge] Delete trip failed:', e.message); });
    };
  }

  // ── Photo bridge ──
  var _origSavePhoto = window.savePhoto;
  if (_origSavePhoto) {
    window.savePhoto = function (tripId, dataUrl) {
      var result = _origSavePhoto(tripId, dataUrl);
      fetch(API_BASE + '/api/trips/' + tripId + '/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: dataUrl })
      }).catch(function () {});
      return result;
    };
  }

  // ── AI bridge ──
  window.callAITripPlan = async function (params) {
    try {
      var r = await fetch(API_BASE + '/api/ai/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (r.ok) return await r.json();
    } catch (e) { console.warn('[AI Bridge] Plan trip failed:', e.message); }
    // Fall back to local mock
    if (window._origGenerateTripPlan) return window._origGenerateTripPlan(params.destination, params.startDate, params.numDays, params.members, params.budget, params.preferences);
    return null;
  };

  window.callAIJournal = async function (data) {
    try {
      var r = await fetch(API_BASE + '/api/ai/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (r.ok) return await r.json();
    } catch (e) { console.warn('[AI Bridge] Journal failed:', e.message); }
    return null;
  };

  // ── Background sync ──
  async function syncToAPI(trips) {
    // This is a full sync — individual CRUD is handled by the overrides above
  }

  // ── Initialize ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncFromAPI);
  } else {
    syncFromAPI();
  }
})();
