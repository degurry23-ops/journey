/* Journey — Photos API Routes (with server-side file storage) */

const express = require('express');
const router = express.Router({ mergeParams: true });
const fs = require('fs');
const path = require('path');
const { db, genId } = require('../db');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
const MAX_SIZE = 10 * 1024 * 1024; // 10MB per image

// Serve uploaded files
router.use('/file', express.static(UPLOADS_DIR));

router.get('/', (req, res) => {
  res.json(db.photos.byTrip(req.params.tripId));
});

router.post('/', (req, res) => {
  if (!db.trips.get(req.params.tripId)) return res.status(404).json({ error: 'Trip not found' });
  const { dataUrl } = req.body;

  if (!dataUrl) return res.status(400).json({ error: 'dataUrl required' });

  // Save base64 to disk file
  let filePath = null;
  if (dataUrl.startsWith('data:')) {
    try {
      const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        if (buffer.length > MAX_SIZE) return res.status(400).json({ error: 'Image too large (max 10MB)' });

        const filename = genId() + '.' + ext;
        filePath = '/api/trips/' + req.params.tripId + '/photos/file/' + filename;
        fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
      }
    } catch(e) { /* fallback to base64 storage */ }
  }

  const photo = {
    id: genId(),
    trip_id: req.params.tripId,
    data_url: filePath || dataUrl,  // use file path if saved, else base64
    created: new Date().toISOString()
  };
  db.photos.insert(photo);
  res.status(201).json(photo);
});

router.delete('/:photoId', (req, res) => {
  // Delete file from disk if stored
  const photo = db.photos.byTrip(req.params.tripId).find(p => p.id === req.params.photoId);
  if (photo && photo.data_url && photo.data_url.startsWith('/api/')) {
    const filename = path.basename(photo.data_url);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.photos.delete(req.params.photoId);
  res.json({ success: true });
});

module.exports = router;
