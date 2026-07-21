/* Journey — SQLite Database (via sql.js, pure JS) */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'journey.db');
let db = null;

// Initialize
async function initDB() {
  const SQL = await initSqlJs();

  // Load existing or create new
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Enable WAL-like behavior (manual)
  db.run('PRAGMA foreign_keys = ON');

  // Schema
  db.run(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      destination TEXT DEFAULT '',
      start_date TEXT DEFAULT '',
      end_date TEXT DEFAULT '',
      members INTEGER DEFAULT 1,
      status TEXT DEFAULT 'planning',
      readiness INTEGER DEFAULT 0,
      emoji TEXT DEFAULT '🌏',
      budget TEXT DEFAULT '',
      preferences TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      created TEXT DEFAULT '',
      updated TEXT DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS trip_days (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      date TEXT DEFAULT '',
      weather TEXT DEFAULT '☀️ 晴 25°C',
      tip TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      day_id TEXT NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT DEFAULT '景点',
      time TEXT DEFAULT '09:00',
      duration TEXT DEFAULT '1h',
      fee TEXT DEFAULT '免费',
      lat REAL,
      lng REAL,
      sort_order INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      category TEXT DEFAULT '餐饮',
      amount REAL NOT NULL DEFAULT 0,
      note TEXT DEFAULT '',
      payer TEXT DEFAULT '我',
      date TEXT DEFAULT '',
      day_id TEXT DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      data_url TEXT NOT NULL,
      created TEXT DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created TEXT DEFAULT ''
    )
  `);

  save();
  console.log('SQLite DB ready');
}

// Save to disk
function save() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Helpers
function genId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

function rowToObj(row, columns) {
  const obj = {};
  columns.forEach((col, i) => { obj[col] = row[i]; });
  return obj;
}

function all(sql, params = []) {
  if (!db) return [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(rowToObj(stmt.get(), stmt.getColumnNames()));
  }
  stmt.free();
  return results;
}

function get(sql, params = []) {
  if (!db) return null;
  const rows = all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function run(sql, params = []) {
  if (!db) return;
  db.run(sql, params);
  save();
}

// Database API
const dbAPI = {
  trips: {
    all: () => all('SELECT * FROM trips ORDER BY created DESC'),
    get: (id) => get('SELECT * FROM trips WHERE id = ?', [id]),
    insert: (trip) => {
      const cols = Object.keys(trip).join(',');
      const vals = Object.values(trip);
      const placeholders = vals.map(() => '?').join(',');
      run(`INSERT INTO trips (${cols}) VALUES (${placeholders})`, vals);
      return trip;
    },
    update: (id, updates) => {
      const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      const vals = Object.values(updates);
      vals.push(id);
      run(`UPDATE trips SET ${sets} WHERE id = ?`, vals);
      return get('SELECT * FROM trips WHERE id = ?', [id]);
    },
    delete: (id) => {
      const days = all('SELECT id FROM trip_days WHERE trip_id = ?', [id]);
      days.forEach(d => run('DELETE FROM places WHERE day_id = ?', [d.id]));
      run('DELETE FROM trip_days WHERE trip_id = ?', [id]);
      run('DELETE FROM expenses WHERE trip_id = ?', [id]);
      run('DELETE FROM photos WHERE trip_id = ?', [id]);
      run('DELETE FROM trips WHERE id = ?', [id]);
    }
  },
  days: {
    byTrip: (tripId) => all('SELECT * FROM trip_days WHERE trip_id = ? ORDER BY sort_order', [tripId]),
    get: (id) => get('SELECT * FROM trip_days WHERE id = ?', [id]),
    count: (tripId) => { const r = get('SELECT COUNT(*) as cnt FROM trip_days WHERE trip_id = ?', [tripId]); return r ? r.cnt : 0; },
    insert: (day) => {
      const cols = Object.keys(day).join(',');
      const vals = Object.values(day);
      run(`INSERT INTO trip_days (${cols}) VALUES (${vals.map(()=>'?').join(',')})`, vals);
      return day;
    }
  },
  places: {
    byDay: (dayId) => all('SELECT * FROM places WHERE day_id = ? ORDER BY sort_order', [dayId]),
    count: (dayId) => { const r = get('SELECT COUNT(*) as cnt FROM places WHERE day_id = ?', [dayId]); return r ? r.cnt : 0; },
    insert: (place) => {
      const cols = Object.keys(place).join(',');
      const vals = Object.values(place);
      run(`INSERT INTO places (${cols}) VALUES (${vals.map(()=>'?').join(',')})`, vals);
      return place;
    },
    delete: (id) => run('DELETE FROM places WHERE id = ?', [id])
  },
  expenses: {
    byTrip: (tripId) => all('SELECT * FROM expenses WHERE trip_id = ? ORDER BY date DESC', [tripId]),
    get: (id) => get('SELECT * FROM expenses WHERE id = ?', [id]),
    insert: (expense) => {
      const cols = Object.keys(expense).join(',');
      const vals = Object.values(expense);
      run(`INSERT INTO expenses (${cols}) VALUES (${vals.map(()=>'?').join(',')})`, vals);
      return expense;
    },
    delete: (id) => run('DELETE FROM expenses WHERE id = ?', [id])
  },
  photos: {
    byTrip: (tripId) => all('SELECT * FROM photos WHERE trip_id = ? ORDER BY created DESC', [tripId]),
    insert: (photo) => {
      const cols = Object.keys(photo).join(',');
      const vals = Object.values(photo);
      run(`INSERT INTO photos (${cols}) VALUES (${vals.map(()=>'?').join(',')})`, vals);
      return photo;
    },
    delete: (id) => run('DELETE FROM photos WHERE id = ?', [id])
  },
  users: {
    all: () => all('SELECT * FROM users'),
    get: (id) => get('SELECT * FROM users WHERE id = ?', [id]),
    getByUsername: (username) => get('SELECT * FROM users WHERE username = ?', [username]),
    insert: (user) => {
      const cols = Object.keys(user).join(',');
      const vals = Object.values(user);
      run(`INSERT INTO users (${cols}) VALUES (${vals.map(()=>'?').join(',')})`, vals);
      return user;
    }
  }
};

module.exports = { initDB, db: dbAPI, genId, DB_PATH };
