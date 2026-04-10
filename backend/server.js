import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import ensureDefaultUser from './utils/ensureDefaultUser.js';
import { requireAuth } from './middlewares/authMiddleware.js';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import companyRoutes from './routes/companies.js';
import orderRoutes from './routes/orders.js';
import salesRoutes from './routes/sales.js';
import expenseRoutes from './routes/expenses.js';
import analyticsRoutes from './routes/analytics.js';
import productRoutes from './routes/products.js';
import purchaseRoutes from './routes/purchases.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is missing in environment variables');
  process.exit(1);
}

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/customers', requireAuth, customerRoutes);
app.use('/api/companies', requireAuth, companyRoutes);
app.use('/api/orders', requireAuth, orderRoutes);
app.use('/api/sales', requireAuth, salesRoutes);
app.use('/api/expenses', requireAuth, expenseRoutes);
app.use('/api/products', requireAuth, productRoutes);
app.use('/api/purchases', requireAuth, purchaseRoutes);
app.use('/api/analytics', requireAuth, analyticsRoutes);

app.get('/', (req, res) => {
  res.send('API running...');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server error' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    await ensureDefaultUser();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (error) => {
      console.error('Server startup error:', error);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
