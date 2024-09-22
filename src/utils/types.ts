import { type Logger } from 'pino';

export type NumRange = [number, number];

export type HonoEnvironment = {
  Variables: {
    logger: Logger;
    requestId: string;
  };
};
