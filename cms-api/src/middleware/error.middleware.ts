import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unexpected / programming errors — log full stack, hide from client in prod
  logger.error(`[Unhandled Error] ${err.message}`, { stack: err.stack });

  res.status(500).json({
    success: false,
    message: env.isProduction()
      ? 'An unexpected error occurred. Please try again later.'
      : err.message,
    ...(env.isDevelopment() && { stack: err.stack }),
  });
}

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}
