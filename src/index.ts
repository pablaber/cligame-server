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

async function main() {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    console.error('MONGO_URI is not set');
    process.exit(1);
  }

  const app = new Hono();

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  app.get('/', (c) => {
    return c.text('Hello Hono!');
  });

  const port = 3000;
  console.log(`Server is running on port ${port}`);

  app.route('/auth', authRouter);
  app.route('/action', actionRouter);
  app.route('/tavern', tavernRouter);

  app.onError((err, c) => {
    if (err instanceof AppError) {
      console.log(err.toLog());
      return c.json(err.toJSON(), err.statusCode);
    }
    const error = new InternalServerError({
      privateContext: {
        cause: err,
      },
    });
    console.log(error.toLog());
    return c.json(error.toJSON(), error.statusCode);
  });

  serve({
    fetch: app.fetch,
    port,
  });
}

main();
