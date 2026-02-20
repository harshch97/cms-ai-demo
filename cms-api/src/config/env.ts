import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

export const env = {
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  PORT: parseInt(optionalEnv('PORT', '3000'), 10),
  API_PREFIX: optionalEnv('API_PREFIX', '/api/v1'),

  DB: {
    HOST: requireEnv('DB_HOST'),
    PORT: parseInt(optionalEnv('DB_PORT', '5432'), 10),
    USER: requireEnv('DB_USER'),
    PASSWORD: requireEnv('DB_PASSWORD'),
    NAME: requireEnv('DB_NAME'),
    POOL_MIN: parseInt(optionalEnv('DB_POOL_MIN', '2'), 10),
    POOL_MAX: parseInt(optionalEnv('DB_POOL_MAX', '10'), 10),
  },

  JWT: {
    SECRET: requireEnv('JWT_SECRET'),
    EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '8h'),
  },

  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV === 'development',
};
