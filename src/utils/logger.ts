import { Context } from 'hono';
import pino, { type Logger } from 'pino';

const { LOG_LEVEL = 'info' } = process.env;

const logger = pino({
  level: LOG_LEVEL,
});

export default logger;

export function httpLogger() {
  return async (c: Context, next: () => Promise<void>) => {
    const requestId = c.req.header('X-Request-Id') || crypto.randomUUID();
    c.set('requestId', requestId);

    const requestLogger = logger.child({ reqId: requestId });
    c.set('logger', requestLogger);

    requestLogger.debug({
      method: c.req.method.toUpperCase(),
      path: c.req.path,
      type: 'access-start',
    });
    await next();
    requestLogger.info({
      method: c.req.method.toUpperCase(),
      path: c.req.path,
      status: c.res.status,
      type: 'access-end',
    });
  };
}

export function getLogger(c: Context) {
  return c.get('logger') as Logger;
}
