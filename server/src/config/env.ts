// Environment Variables Configuration & Parser
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sales_inventory_db',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_key_retail_copilot_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'sk-proj-mock-key'
};
