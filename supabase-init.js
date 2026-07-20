// Journey Prototype — AI Integration (no CDN needed)
const SUPABASE_URL = 'https://vddipatvlyvciolwabqh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4ogDVBGxhuJTZrRb0RtuPg_6e77MnA8';

// ── AI: Call Edge Function directly via fetch ──
async function aiPlanTrip(params) {
  try {
    const res = await fetch(SUPABASE_URL + '/functions/v1/ai-plan-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_KEY },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI request failed');
    return data;
  } catch(e) { console.warn('AI plan failed:', e.message); return null; }
}

async function aiJournal(tripData) {
  try {
    const res = await fetch(SUPABASE_URL + '/functions/v1/ai-journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_KEY },
      body: JSON.stringify(tripData)
    });
    return await res.json();
  } catch(e) { console.warn('AI journal failed:', e.message); return null; }
}

// ── Aliases (used by pages) ──
var callAITripPlan = aiPlanTrip;
var callAIJournal = aiJournal;

// ── DB: Save trip ──
async function saveTripToDB(trip) {
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_KEY, 'apikey': SUPABASE_KEY, 'Prefer': 'return=representation' },
      body: JSON.stringify({ name: trip.name, destination: trip.destination, start_date: trip.startDate, end_date: trip.endDate, budget: trip.budget || 0, members_count: trip.members || 1, status: 'planning', readiness: 30 })
    });
    const data = await res.json();
    if (!res.ok) { console.warn('DB save failed:', data); return null; }
    const tripId = data[0]?.id;
    // Insert days + places
    for (let di = 0; di < trip.days.length; di++) {
      const d = trip.days[di];
      const dRes = await fetch(SUPABASE_URL + '/rest/v1/days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_KEY, 'apikey': SUPABASE_KEY, 'Prefer': 'return=representation' },
        body: JSON.stringify({ trip_id: tripId, day_number: di + 1, date: d.date, weather: d.weather || '☀️ 晴 25°C', ai_tip: d.tip || '' })
      });
      const dayData = await dRes.json();
      if (dayData[0]?.id && d.places?.length) {
        const placesToInsert = d.places.map((p, i) => ({ day_id: dayData[0].id, name: p.name, category: p.cat || p.category || '景点', time_slot: p.time || '09:00', duration: p.duration || '1h', fee: p.fee || '免费', lat: p.lat || null, lng: p.lng || null, sort_order: i }));
        await fetch(SUPABASE_URL + '/rest/v1/places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_KEY, 'apikey': SUPABASE_KEY },
          body: JSON.stringify(placesToInsert)
        });
      }
    }
    return tripId;
  } catch(e) { console.warn('DB save failed:', e.message); return null; }
}
