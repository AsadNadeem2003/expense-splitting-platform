import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import groupRoutes from './routes/group.routes';
import expenseRoutes from './routes/expense.routes';
import settlementRoutes from './routes/settlement.routes';
import errorHandler from './middleware/errorHandler';
import { initCronJobs } from './config/cron';
import { globalApiLimiter, authLimiter } from './middleware/rateLimiter';

const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';

// ── 1. Global Security Headers (Helmet) ─────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permits serving payment screenshot uploads
}));

// ── 2. CORS Policy ─────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || !isProduction) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not permitted by CORS policy`));
    }
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// ── 3. Global API Rate Limiter ──────────────────────
app.use('/api', globalApiLimiter);

// ── 4. Swagger Production Guard ─────────────────────
if (!isProduction) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SplitEase API Docs',
  }));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
} else {
  app.use('/api-docs', (req, res) => {
    res.status(404).json({ error: 'Swagger documentation is disabled in production environment.' });
  });
}

// ── 5. Protected Route Handlers ─────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);

app.use('/uploads', express.static('public/uploads'));
app.use('/api/uploads', express.static('public/uploads'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'SplitEase Engine active', env: process.env.NODE_ENV || 'development' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 SplitEase backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  if (!isProduction) {
    console.log(`📚 Swagger API docs available at http://localhost:${PORT}/api-docs`);
  } else {
    console.log(`🔒 Swagger API docs disabled in production mode`);
  }
  initCronJobs();
});
