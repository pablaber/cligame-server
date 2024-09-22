import type { NumRange } from './types';

export function randomInRange(range: NumRange) {
  const [min, max] = range;
  if (min > max) {
    throw new Error('Min cannot be greater than max');
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
