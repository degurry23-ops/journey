// Journey Prototype — Supabase + AI Integration
// Add <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script> before this

const SUPABASE_URL = 'https://vddipatvlyvciolwabqh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4ogDVBGxhuJTZrRb0RtuPg_6e77MnA8';
const sb = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── AI: Call Edge Function ──
async function aiPlanTrip(params) {
  if (!sb) return null;
  try {
    const { data, error } = await sb.functions.invoke('ai-plan-trip', { body: params });
    if (error) throw error;
    return data;
  } catch(e) { console.warn('AI plan failed:', e.message); return null; }
}

async function aiJournal(tripData) {
  if (!sb) return null;
  try {
    const { data, error } = await sb.functions.invoke('ai-journal', { body: tripData });
    if (error) throw error;
    return data;
  } catch(e) { console.warn('AI journal failed:', e.message); return null; }
}

// ── DB: Save trip to Supabase ──
async function saveTripToDB(trip) {
  if (!sb) return null;
  try {
    const { data, error } = await sb.from('trips').insert({
      name: trip.name, destination: trip.destination,
      start_date: trip.startDate, end_date: trip.endDate,
      budget: trip.budget || 0, members_count: trip.members?.length || 1,
      status: 'planning', readiness: 30
    }).select().single();
    if (error) throw error;

    // Insert days + places
    for (let di = 0; di < trip.days.length; di++) {
      const d = trip.days[di];
      const { data: dayData } = await sb.from('days').insert({
        trip_id: data.id, day_number: di + 1, date: d.date,
        weather: d.weather || '☀️ 晴 25°C', ai_tip: d.tip || ''
      }).select().single();

      if (dayData && d.places?.length) {
        const placesToInsert = d.places.map((p, i) => ({
          day_id: dayData.id, name: p.name,
          category: p.cat || p.category || '景点',
          time_slot: p.time || '09:00', duration: p.duration || '1h',
          fee: p.fee || '免费', lat: p.lat || null, lng: p.lng || null,
          sort_order: i
        }));
        await sb.from('places').insert(placesToInsert);
      }
    }
    return data;
  } catch(e) { console.warn('DB save failed:', e.message); return null; }
}

async function fetchTripsFromDB() {
  if (!sb) return null;
  const { data, error } = await sb.from('trips').select('*, days(*, places(*)), expenses(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
