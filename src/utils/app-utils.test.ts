import { describe, expect, test } from 'vitest';

import { randomInRange, boundValue } from './app-utils';

describe('randomInRange', () => {
  test('returns a random number between min and max', () => {
    let min = 1;
    let max = 10;
    let randomNumber = randomInRange([min, max]);
    expect(randomNumber).toBeGreaterThanOrEqual(min);
    expect(randomNumber).toBeLessThanOrEqual(max);

    min = 100;
    max = 200;
    randomNumber = randomInRange([min, max]);
    expect(randomNumber).toBeGreaterThanOrEqual(min);
    expect(randomNumber).toBeLessThanOrEqual(max);
  });

  test('should be inclusive of min and max', () => {
    const randomNumber = randomInRange([1, 1]);
    expect(randomNumber).toBe(1);
  });

  test('should throw an error if min is greater than max', () => {
    expect(() => randomInRange([10, 1])).toThrow(
      'Min cannot be greater than max',
    );
  });
});

describe('boundValue', () => {
  test('returns a value within the range', () => {
    expect(boundValue(5, [0, 10])).toBe(5);
    expect(boundValue(15, [0, 10])).toBe(10);
    expect(boundValue(-5, [0, 10])).toBe(0);
  });
});
