import { type Logger } from 'pino';

export type HonoEnvironment = {
  Variables: {
    logger: Logger;
    requestId: string;
  };
};
