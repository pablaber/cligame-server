import { config } from 'dotenv';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import mongoose from 'mongoose';

// Load environment variables
config();

import authRouter from './routes/auth';

async function main() {
  const {
    MONGO_URI,
  } = process.env;
  
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

  serve({
    fetch: app.fetch,
    port,
  });
}

main();
