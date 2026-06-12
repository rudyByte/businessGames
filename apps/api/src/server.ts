import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

dotenv.config();

export const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);
app.use('/api/v1', apiRouter);

app.get('/', (req, res) => {
  res.redirect('/api/v1/health');
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found.` }
  });
});

app.use(errorHandler);

export async function connectDatabase() {
  await prisma.$connect();
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
