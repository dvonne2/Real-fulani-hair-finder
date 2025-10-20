import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import quizResultsRouter from './routes/quizResults.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) || '*',
    credentials: true,
  })
);

app.use('/health', healthRouter);
app.use('/quiz-results', quizResultsRouter);

export default app;
