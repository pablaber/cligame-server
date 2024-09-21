import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryStore } from './MemoryStore';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('it should set and get a value', () => {
  const store = new MemoryStore<number>({ ttl: 5000 });
  store.set('test', 1);
  expect(store.keys()).toEqual(['test']);
  expect(store.get('test')).toBe(1);
  store.set('test', 2);
  expect(store.keys()).toEqual(['test']);
});

test('it should return null if the key does not exist', () => {
  const store = new MemoryStore<number>({ ttl: 5000 });
  expect(store.keys()).toEqual([]);
  expect(store.get('test')).toBeNull();
});

test('it should return null if the key has expired', () => {
  const store = new MemoryStore<number>({ ttl: 5000 });
  store.set('test', 1);
  expect(store.get('test')).toBe(1);
  expect(store.keys()).toEqual(['test']);
  vi.advanceTimersByTime(6000);
  expect(store.get('test')).toBeNull();
  expect(store.keys()).toEqual([]);
});

test('it should delete a key', () => {
  const store = new MemoryStore<number>({ ttl: 5000 });
  store.set('test', 1);
  expect(store.get('test')).toBe(1);
  expect(store.keys()).toEqual(['test']);
  store.delete('test');
  expect(store.get('test')).toBeNull();
  expect(store.keys()).toEqual([]);
});
