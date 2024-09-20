import { test, expect } from 'vitest';
import { upperFirst } from './helpers';

test('upperFirst', () => {
  expect(upperFirst('hello')).toBe('Hello');
  expect(upperFirst('HELLO')).toBe('HELLO');
  expect(upperFirst('')).toBe('');
});
