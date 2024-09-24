import { minutesToMilliseconds } from 'date-fns';

// Energy
export const ENERGY_REGEN_RATE_MINUTES = 1;
export const ENERGY_MAX = 100;

// Health
export const HEALTH_MAX_BASE = 20;
export const HEALTH_REGEN_RATE_MINUTES = 10;

// Fighting
// The base chance to hit an opposing fighter when at the same level.
export const CHANCE_TO_HIT_BASE = 0.7;
// The amount of chance to hit that is added (or subtracted) for each level
// difference between the attacker and defender.
export const HIT_CHANCE_PER_LEVEL = 0.1;
// The combat exhaustion level is the maximum number of attacks that can happen
// in a fight. It is used to prevent infinite fights.
export const COMBAT_EXHAUSTION_LEVEL = 100;
// The amount of money a player starts with.
export const MONEY_STARTING = 100;

// Leveling up XP scaling

// X represents the amount of xp needed to reach the next level before scaling
// with Y. The lower this number is, the more XP base is needed to reach the
// next level.
export const LEVEL_XP_SCALING_X = 0.05;

// Y represents how quickly the XP curve scales. The higher this number is, the
// faster the XP required for the next level increases.
export const LEVEL_XP_SCALING_Y = 1.6;

// Calculated values, do not modify

export const ENERGY_REGEN_RATE_MS = minutesToMilliseconds(
  ENERGY_REGEN_RATE_MINUTES,
);
export const HEALTH_REGEN_RATE_MS = minutesToMilliseconds(
  HEALTH_REGEN_RATE_MINUTES,
);
