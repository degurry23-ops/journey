/* Journey — Express API Server */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const tripsRouter = require('./routes/trips');
const expensesRouter = require('./routes/expenses');
const photosRouter = require('./routes/photos');
const aiRouter = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API Routes
app.use('/api/trips', tripsRouter);
app.use('/api/trips/:tripId/expenses', expensesRouter);
app.use('/api/trips/:tripId/photos', photosRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve Frontend Static Files
const publicDir = path.join(__dirname, '..');
app.use(express.static(publicDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(publicDir, req.path));
});

// Start
app.listen(PORT, () => {
  console.log('Journey API Server running at http://localhost:' + PORT);
  console.log('Serving frontend from: ' + publicDir);
  console.log('AI Provider: ' + (process.env.AI_PROVIDER || 'mock (fallback)'));
});
