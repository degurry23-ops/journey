/* Journey — Photos API Routes */

const express = require('express');
const router = express.Router({ mergeParams: true });
const { db, genId } = require('../db');

router.get('/', (req, res) => {
  res.json(db.photos.byTrip(req.params.tripId));
});

router.post('/', (req, res) => {
  if (!db.trips.get(req.params.tripId)) return res.status(404).json({ error: 'Trip not found' });
  const { dataUrl } = req.body;
  if (!dataUrl) return res.status(400).json({ error: 'dataUrl required' });
  const photo = { id: genId(), trip_id: req.params.tripId, data_url: dataUrl, created: new Date().toISOString() };
  db.photos.insert(photo);
  res.status(201).json(photo);
});

router.delete('/:photoId', (req, res) => {
  db.photos.delete(req.params.photoId);
  res.json({ success: true });
});

module.exports = router;
