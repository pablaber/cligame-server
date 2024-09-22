import { config } from 'dotenv';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import mongoose from 'mongoose';

// Load environment variables
config();

import authRouter from './routes/auth';
import actionRouter from './routes/action';
import tavernRouter from './routes/tavern';
import { AppError, InternalServerError } from './utils/errors';
import logger, { getLogger, httpLogger } from './utils/logger';
import type { HonoEnvironment } from './utils/types';

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

  const app = new Hono<HonoEnvironment>();

  // Adds logging to each request and sets the logger on the request context.
  // Also adds a request ID to each request.
  app.use(httpLogger());

  app.get('/', (c) => {
    return c.text('Hello Hono!');
  });

  app.route('/auth', authRouter);
  app.route('/action', actionRouter);
  app.route('/tavern', tavernRouter);

  app.onError((err, c) => {
    const errorLogger = getLogger(c);
    if (err instanceof AppError) {
      errorLogger.error(err.toLog());
      return c.json(err.toJSON(), err.statusCode);
    }
    const error = new InternalServerError({
      privateContext: {
        cause: err,
      },
    });
    errorLogger.error(error.toLog());
    return c.json(error.toJSON(), error.statusCode);
  });

  serve({
    fetch: app.fetch,
    port,
  });

  logger.info(`[STARTUP] Server listening on port ${port}`);
}

main();
