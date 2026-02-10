// File: backend/src/app.js
// ROOMI Backend - Express server

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const itemsRoutes = require('./routes/items.routes');
const categoriesRoutes = require('./routes/categories.routes');
const customersRoutes = require('./routes/customers.routes');
const rentalsRoutes = require('./routes/rentals.routes');
const salesRoutes = require('./routes/sales.routes');
const outputRoutes = require('./routes/output.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true })); // allow all origins for dev; set CORS_ORIGIN in prod
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/items', itemsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/rentals', rentalsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/output', outputRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'ROOMI API' });
});

// Serve frontend (so opening http://localhost:3000 shows the app)
const frontendPath = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendPath));
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 404 for API only; HTML fallback is handled by static
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`ROOMI API running at http://localhost:${PORT}`);
});
