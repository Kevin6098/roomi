import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFoundMiddleware } from './middlewares/error.middleware.js';
import { requireAuth } from './middlewares/auth.middleware.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import itemsRoutes from './routes/items.routes.js';
import customersRoutes from './routes/customers.routes.js';
import contactsRoutes from './routes/contacts.routes.js';
import rentalsRoutes from './routes/rentals.routes.js';
import salesRoutes from './routes/sales.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();

app.use(cors({ origin: config.corsOrigin ?? true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'ROOMI API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

app.use('/api/categories', requireAuth, categoriesRoutes);
app.use('/api/items', requireAuth, itemsRoutes);
app.use('/api/customers', requireAuth, customersRoutes);
app.use('/api/contacts', requireAuth, contactsRoutes);
app.use('/api/rentals', requireAuth, rentalsRoutes);
app.use('/api/sales', requireAuth, salesRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);

// 404 for any unmatched /api route (so frontend gets JSON, not HTML)
app.use('/api', notFoundMiddleware);

app.use(errorMiddleware);

export default app;
