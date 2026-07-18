import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vddipatvlyvciolwabqh.supabase.co'
const supabaseAnonKey = 'sb_publishable_4ogDVBGxhuJTZrRb0RtuPg_6e77MnA8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Auth ──
export async function signIn(email) {
  const { error } = await supabase.auth.signInWithOtp({ email })
  return { error }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export function getUser() {
  return supabase.auth.getUser()
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null)
  })
}

// ── Trips ──
export async function fetchTrips() {
  const { data, error } = await supabase
    .from('trips')
    .select('*, days(*, places(*)), expenses(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createTrip(trip) {
  const { data, error } = await supabase
    .from('trips')
    .insert({
      name: trip.name,
      destination: trip.destination,
      start_date: trip.startDate || trip.start_date,
      end_date: trip.endDate || trip.end_date,
      budget: trip.budget || 0,
      members_count: trip.members || trip.members_count || 1,
      status: 'planning',
      readiness: 30,
    })
    .select()
    .single()
  if (error) throw error

  // Create days and places
  if (trip.days?.length) {
    for (const day of trip.days) {
      const { data: dayData } = await supabase
        .from('days')
        .insert({
          trip_id: data.id,
          day_number: day.day || (trip.days.indexOf(day) + 1),
          date: day.date,
          weather: day.weather || '☀️ 晴 25°C',
          ai_tip: day.tip || '',
        })
        .select()
        .single()

      if (dayData && day.places?.length) {
        const placesToInsert = day.places.map((p, i) => ({
          day_id: dayData.id,
          name: p.name,
          category: p.cat || p.category || '景点',
          time_slot: p.time || p.time_slot || '09:00',
          duration: p.duration || '1h',
          fee: p.fee || '免费',
          lat: p.lat || null,
          lng: p.lng || null,
          sort_order: i,
        }))
        await supabase.from('places').insert(placesToInsert)
      }
    }
  }

  return data
}

export async function updateTripStatus(id, status) {
  const { error } = await supabase
    .from('trips')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteTrip(id) {
  const { error } = await supabase.from('trips').delete().eq('id', id)
  if (error) throw error
}

// ── Places ──
export async function addPlace(dayId, place) {
  const { data, error } = await supabase
    .from('places')
    .insert({ ...place, day_id: dayId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removePlace(id) {
  const { error } = await supabase.from('places').delete().eq('id', id)
  if (error) throw error
}

// ── Expenses ──
export async function fetchExpenses(tripId) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addExpense(tripId, expense) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...expense, trip_id: tripId })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Journal ──
export async function fetchJournal(tripId) {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('trip_id', tripId)
    .single()
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
  return data
}

export async function saveJournal(tripId, journal) {
  const { data, error } = await supabase
    .from('journals')
    .upsert({ trip_id: tripId, ...journal })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── AI (Edge Functions) ──
export async function aiPlanTrip(params) {
  const { data, error } = await supabase.functions.invoke('ai-plan-trip', {
    body: params,
  })
  if (error) throw error
  return data
}

export async function aiGenerateJournal(tripData) {
  const { data, error } = await supabase.functions.invoke('ai-journal', {
    body: tripData,
  })
  if (error) throw error
  return data
}
