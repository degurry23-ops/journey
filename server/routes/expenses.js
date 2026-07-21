/* Journey — Expenses API Routes */

const express = require('express');
const router = express.Router({ mergeParams: true });
const { db, genId } = require('../db');

// GET /api/trips/:tripId/expenses
router.get('/', (req, res) => {
  res.json(db.expenses.byTrip(req.params.tripId));
});

// POST /api/trips/:tripId/expenses
router.post('/', (req, res) => {
  if (!db.trips.get(req.params.tripId)) return res.status(404).json({ error: 'Trip not found' });
  const { amount, category, note, payer, date, dayId } = req.body;
  if (!amount || parseFloat(amount) <= 0) return res.status(400).json({ error: 'Invalid amount' });

  const expense = {
    id: genId(),
    trip_id: req.params.tripId,
    category: category || '餐饮',
    amount: parseFloat(amount),
    note: note || '',
    payer: payer || '我',
    date: date || new Date().toISOString().split('T')[0],
    day_id: dayId || ''
  };
  db.expenses.insert(expense);
  res.status(201).json(expense);
});

// DELETE /api/trips/:tripId/expenses/:expenseId
router.delete('/:expenseId', (req, res) => {
  db.expenses.delete(req.params.expenseId);
  res.json({ success: true });
});

module.exports = router;
