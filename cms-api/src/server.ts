import app from './app';
import { env } from './config/env';
import { testConnection } from './config/db';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  // Validate DB connection before accepting traffic
  try {
    await testConnection();
    logger.info('[DB] PostgreSQL connection pool established');
  } catch (err) {
    logger.error('[DB] Failed to connect to PostgreSQL:', (err as Error).message);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(
      `[SERVER] CMS API running on port ${env.PORT} (${env.NODE_ENV})`
    );
    logger.info(`[SERVER] API prefix: ${env.API_PREFIX}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`[SERVER] ${signal} received — shutting down gracefully`);
    server.close(async () => {
      logger.info('[SERVER] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('[SERVER] Unhandled promise rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    logger.error('[SERVER] Uncaught exception:', err.message);
    process.exit(1);
  });
}

bootstrap();
