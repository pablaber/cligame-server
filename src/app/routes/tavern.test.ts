import { test, expect } from 'vitest';

import { createTestDatabase } from '../../../tests/test-utils';
import { createHonoApp } from '../app';

const CHARACTER_NAME = 'Test Character';
const EMAIL = 'test@example.com';

const { generateAuthHeadersObject } = createTestDatabase([
  {
    characterName: CHARACTER_NAME,
    email: EMAIL,
  },
]);
const app = createHonoApp();

test('should validate the auth header', async () => {
  const response = await app.request('/tavern', {
    headers: { Authorization: 'Bearer invalid' },
  });
  expect(response.status).toBe(401);
  const body = await response.json();
  expect(body).toEqual({
    error: {
      name: 'UnauthorizedError',
      message: 'The request is not authorized.',
    },
  });
});

test('should return the appropriate information on a happy path', async () => {
  const response = await app.request('/tavern', {
    headers: generateAuthHeadersObject(),
  });
  expect(response.status).toBe(200);

  const body = await response.json();
  expect(body.user).toBeDefined();
  expect(body.user.character.name).toBe(CHARACTER_NAME);
  expect(body.user.email).toBe(EMAIL);
});
