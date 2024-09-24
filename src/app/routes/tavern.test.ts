import { test, expect, vi, beforeEach, afterEach } from 'vitest';

import { createTestDatabase } from '../../../tests/test-utils';
import { createHonoApp } from '../app';
import { getXpForLevel } from '../../utils/level-utils';
import { addMinutes } from 'date-fns';
import {
  ENERGY_REGEN_RATE_MINUTES,
  HEALTH_REGEN_RATE_MINUTES,
} from '../../constants/game-constants';

const CHARACTER_NAME = 'Test Character';
const EMAIL = 'test@example.com';
const CHARACTER_MONEY = 150;
const CHARACTER_HEALTH = 10;
const CHARACTER_ENERGY = 80;
const STRENGTH_XP = getXpForLevel(1) + 10;
const DEFENSE_XP = getXpForLevel(3) + 50;

const now = new Date();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
});

const { generateAuthHeadersObject } = createTestDatabase([
  {
    email: EMAIL,
    characterName: CHARACTER_NAME,
    characterMoney: CHARACTER_MONEY,
    characterHealth: CHARACTER_HEALTH,
    characterEnergy: CHARACTER_ENERGY,
    characterSkills: {
      strengthXp: STRENGTH_XP,
      defenseXp: DEFENSE_XP,
    },
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
  expect(body.user.character.money).toBe(CHARACTER_MONEY);

  expect(body.user.character.health).toEqual({
    current: CHARACTER_HEALTH,
    nextTickDate: addMinutes(now, HEALTH_REGEN_RATE_MINUTES).toISOString(),
  });

  expect(body.user.character.energy).toEqual({
    current: CHARACTER_ENERGY,
    nextTickDate: addMinutes(now, ENERGY_REGEN_RATE_MINUTES).toISOString(),
  });

  expect(body.user.character.skills).toEqual({
    strength: {
      xp: STRENGTH_XP,
      level: 1,
      xpToNextLevel: getXpForLevel(2) - STRENGTH_XP,
    },
    defense: {
      xp: DEFENSE_XP,
      level: 3,
      xpToNextLevel: getXpForLevel(4) - DEFENSE_XP,
    },
  });
});
