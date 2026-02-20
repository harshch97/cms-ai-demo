import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

export const logger = winston.createLogger({
  level: env.isDevelopment() ? 'debug' : 'info',
  format: env.isProduction() ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
});
