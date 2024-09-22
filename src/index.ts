import { config } from 'dotenv';
import { serve } from '@hono/node-server';
import mongoose from 'mongoose';

// Load environment variables
config();

import logger from './utils/logger';
import { createHonoApp } from './app/app';

async function main() {
  const { MONGO_URI, PORT = '3000', LOG_LEVEL = 'info' } = process.env;
  const port = parseInt(PORT);

  logger.level = LOG_LEVEL;
  logger.info('[STARTUP] Starting server');
  logger.info(`[STARTUP] Log LEVEL: ${LOG_LEVEL}`);

  if (isNaN(port)) {
    logger.error('[STARTUP] PORT is not a number');
    process.exit(1);
  }

  if (!MONGO_URI) {
    logger.error('[STARTUP] MONGO_URI is not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
  } catch (error) {
    logger.error('[STARTUP] MongoDB connection error:', error);
    process.exit(1);
  }

  const app = createHonoApp();

  serve({
    fetch: app.fetch,
    port,
  });

  logger.info(`[STARTUP] Server listening on port ${port}`);
}

main();
