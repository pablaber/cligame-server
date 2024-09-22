import { Hono } from 'hono';

import { getLogger, httpLogger } from '../utils/logger';
import { authRouter, actionRouter, tavernRouter } from './routes';
import type { HonoEnvironment } from '../utils/types';
import { AppError, InternalServerError } from '../utils/errors';

export function createHonoApp() {
  const app = new Hono<HonoEnvironment>();

  // Adds logging to each request and sets the logger on the request context.
  // Also adds a request ID to each request.
  app.use(httpLogger());

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

  return app;
}
