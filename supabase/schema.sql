-- Journey Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vddipatvlyvciolwabqh

-- Profiles (auto-created on signup)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'planning',
  budget INTEGER DEFAULT 0,
  members_count INTEGER DEFAULT 1,
  readiness INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Days
CREATE TABLE IF NOT EXISTS days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  date DATE,
  weather TEXT DEFAULT '☀️ 晴 25°C',
  ai_tip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Places
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES days(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT '景点',
  time_slot TEXT DEFAULT '09:00',
  duration TEXT DEFAULT '1h',
  fee TEXT DEFAULT '免费',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  day_id UUID REFERENCES days(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT '餐饮',
  amount INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  payer TEXT DEFAULT '我',
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journals
CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE UNIQUE NOT NULL,
  cover_summary TEXT,
  highlights TEXT[],
  stats JSONB,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only see their own data
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own trips" ON trips
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own days" ON days
  FOR ALL USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = days.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Users can manage their own places" ON places
  FOR ALL USING (EXISTS (SELECT 1 FROM days JOIN trips ON trips.id = days.trip_id WHERE days.id = places.day_id AND trips.user_id = auth.uid()));

CREATE POLICY "Users can manage their own expenses" ON expenses
  FOR ALL USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Users can manage their own journals" ON journals
  FOR ALL USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = journals.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);
