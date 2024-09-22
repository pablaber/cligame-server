import { createMiddleware } from 'hono/factory';
import { getConnInfo } from '@hono/node-server/conninfo';
import { MemoryStore } from './MemoryStore';
import { RateLimitExceededError } from './errors';

type RateLimitOptions = {
  windowInMs: number;
  limitInWindow: number;
};

type RateLimitEntry = {
  timestamp: number;
};

/**
 * Filters the entries to only include those within the specified window.
 */
function rateLimitEntriesInWindow(
  entries: RateLimitEntry[],
  windowInMs: number,
) {
  const currentTime = Date.now();
  return entries.filter((entry) => currentTime - entry.timestamp <= windowInMs);
}

export function rateLimit(options: RateLimitOptions) {
  const { windowInMs, limitInWindow } = options;
  const store = new MemoryStore<RateLimitEntry[]>({ ttl: windowInMs });

  return createMiddleware(async (c, next) => {
    // Prune the store to remove expired entries
    store.prune();

    // Get the connection info
    const info = getConnInfo(c);
    const ip = info.remote.address;
    const key = `rate-limit:${ip}`;

    // Get the entries for the IP
    const totalEntries = store.get(key) || [];
    const entriesInWindow = rateLimitEntriesInWindow(totalEntries, windowInMs);

    if (entriesInWindow.length >= limitInWindow) {
      throw new RateLimitExceededError('Rate limit exceeded', {
        privateContext: {
          ip,
          entriesInWindow,
        },
      });
    }

    // Add the current timestamp to the entries
    entriesInWindow.push({ timestamp: Date.now() });

    // Store the updated entries
    store.set(key, entriesInWindow);

    await next();
  });
}
