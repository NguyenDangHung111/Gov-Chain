import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import caseRoutes from './routes/case.routes';
import authRoutes from './routes/auth.routes';
import sequelize from './config/database';
import User from './models/User';
import Transaction from './models/Transaction';
import StatusLog from './models/StatusLog';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);

const port = process.env.PORT || 4000;

// Sync database and start server
sequelize.sync().then(async () => {
  console.log('Database connected and synced');

  // Clear blockchain-related data on startup (since blockchain is ephemeral)
  try {
    await Transaction.destroy({ where: {}, truncate: true });
    await StatusLog.destroy({ where: {}, truncate: true });
    console.log('Cleared old blockchain data (Transactions, StatusLogs)');
  } catch (error) {
    console.error('Error clearing old data:', error);
  }

  app.listen(port, () => console.log('Backend running on port', port));
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
