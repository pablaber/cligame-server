import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRegeneratingValueSchema } from './regenerating-value';

import { subHours, subMinutes, minutesToMilliseconds } from 'date-fns';

const FIVE_MINUTES_MS = minutesToMilliseconds(5);
const { getCurrentValue, addValue } = createRegeneratingValueSchema({
  regenerateTickMs: FIVE_MINUTES_MS,
  maxValue: 100,
  minValue: 0,
});

describe('getCurrentValue', () => {
  test('should return the correct value for a default regeneration schema', () => {
    const currentValue = getCurrentValue({
      valueAtUpdate: 100,
      lastUpdate: subHours(new Date(), 1),
      nextTick: 0,
    });

    expect(currentValue).toBe(100);
  });

  test('should return the correct value when not at max value', () => {
    const currentValue = getCurrentValue({
      valueAtUpdate: 50,
      lastUpdate: subMinutes(new Date(), 50),
      nextTick: 0,
    });

    expect(currentValue).toBe(60);
  });

  test('should properly apply the nextTick value', () => {
    const currentValuePreTick = getCurrentValue({
      valueAtUpdate: 50,
      lastUpdate: subMinutes(new Date(), 18),
      nextTick: minutesToMilliseconds(1.5),
    });

    expect(currentValuePreTick).toBe(53);

    const currentValuePostTick = getCurrentValue({
      valueAtUpdate: 50,
      lastUpdate: subMinutes(new Date(), 19),
      nextTick: minutesToMilliseconds(1.5),
    });

    expect(currentValuePostTick).toBe(54);
  });
});

describe('addValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  test('should update the value correctly in a case with no overflow and no next tick', () => {
    const now = new Date();
    vi.setSystemTime(now);

    const res = addValue(
      {
        valueAtUpdate: 18,
        lastUpdate: subMinutes(now, 10),
        nextTick: 0,
      },
      10,
    );

    expect(res.newValueAtUpdate).toBe(30);
    expect(res.newLastUpdate).toEqual(now);
    expect(res.newNextTick).toBe(0);
  });

  test('should update the value correctly in a case with no overflow and a next tick', () => {
    const now = new Date();
    vi.setSystemTime(now);

    const res = addValue(
      {
        valueAtUpdate: 18,
        lastUpdate: subMinutes(now, 10),
        nextTick: minutesToMilliseconds(1.5),
      },
      10,
    );

    expect(res.newValueAtUpdate).toBe(30);
    expect(res.newLastUpdate).toEqual(now);
    expect(res.newNextTick).toBe(minutesToMilliseconds(1.5));
  });

  test('should update the value correctly in a case with overflow', () => {
    const now = new Date();
    vi.setSystemTime(now);

    const res = addValue(
      {
        valueAtUpdate: 18,
        lastUpdate: subMinutes(now, 11),
        nextTick: minutesToMilliseconds(1.5),
      },
      10,
    );

    expect(res.newValueAtUpdate).toBe(30);
    expect(res.newLastUpdate).toEqual(now);
    expect(res.newNextTick).toBe(minutesToMilliseconds(0.5));
  });

  test('should update the value correctly in the case when the value is greater than the max value due to time passing', () => {
    const now = new Date();
    vi.setSystemTime(now);

    const res = addValue(
      {
        valueAtUpdate: 90,
        lastUpdate: subMinutes(now, 100),
        nextTick: minutesToMilliseconds(2.5),
      },
      1,
    );

    expect(res.newValueAtUpdate).toBe(100);
    expect(res.newLastUpdate).toEqual(now);
    expect(res.newNextTick).toBe(0);
  });

  test('should update the value correctly in the case when the value is greater than the max value due to value added', () => {
    const now = new Date();
    vi.setSystemTime(now);

    const res = addValue(
      {
        valueAtUpdate: 90,
        lastUpdate: subMinutes(now, 1),
        nextTick: minutesToMilliseconds(2),
      },
      20,
    );

    expect(res.newValueAtUpdate).toBe(100);
    expect(res.newLastUpdate).toEqual(now);
    expect(res.newNextTick).toBe(0);
  });

  test('should work with negative values as well', () => {
    const now = new Date();
    vi.setSystemTime(now);

    const res = addValue(
      {
        valueAtUpdate: 18,
        lastUpdate: subMinutes(now, 11),
        nextTick: minutesToMilliseconds(1.5),
      },
      -10,
    );

    expect(res.newValueAtUpdate).toBe(10);
    expect(res.newLastUpdate).toEqual(now);
    expect(res.newNextTick).toBe(minutesToMilliseconds(0.5));
  });
});
