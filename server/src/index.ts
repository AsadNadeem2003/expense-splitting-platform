import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import groupRoutes from './routes/group.routes';
import expenseRoutes from './routes/expense.routes';
import settlementRoutes from './routes/settlement.routes';
import errorHandler from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);

app.use('/uploads', express.static('public/uploads'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Engine active' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server execution layer running on port ${PORT}`);
});
