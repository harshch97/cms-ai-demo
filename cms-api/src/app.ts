import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import apiRoutes from './routes/index';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { requestLogger } from './middleware/request-logger.middleware';

const app = express();

// ── Security & parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());

// Limit request body size to prevent payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Request logging ──────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', environment: env.NODE_ENV });
});

// ── API routes ───────────────────────────────────────────────────────────────
app.use(env.API_PREFIX, apiRoutes);

// ── 404 handler (must come after all routes) ─────────────────────────────────
app.use(notFoundMiddleware);

// ── Global error handler (must be last middleware) ───────────────────────────
app.use(errorMiddleware);

export default app;
