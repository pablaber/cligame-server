import { hoursToMilliseconds, minutesToMilliseconds } from 'date-fns';

// Auth Related Constants
export const REFRESH_TOKEN_EXPIRATION_DAYS = 30;
export const ACCESS_TOKEN_EXPIRATION_HOURS = 1;
export const PASSWORD_SALT_BYTES = 16;
export const REFRESH_TOKEN_BYTES = 32;
export const EMAIL_CHALLENGE_BYTES = 32;

// Lengths
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const CHARACTER_NAME_MIN_LENGTH = 3;
export const CHARACTER_NAME_MAX_LENGTH = 20;

// Rate Limiting
export const REGISTER_RATE_LIMIT_WINDOW_MS = minutesToMilliseconds(60);
export const REGISTER_RATE_LIMIT_LIMIT = 10;

// Calculated Constants do not modify
export const ACCESS_TOKEN_EXPIRATION_MS = hoursToMilliseconds(
  ACCESS_TOKEN_EXPIRATION_HOURS,
);
