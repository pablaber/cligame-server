import { hoursToMilliseconds } from 'date-fns';

// Auth Related Constants
export const REFRESH_TOKEN_EXPIRATION_DAYS = 30;
export const ACCESS_TOKEN_EXPIRATION_HOURS = 1;
export const PASSWORD_SALT_BYTES = 16;
export const REFRESH_TOKEN_BYTES = 32;
export const EMAIL_CHALLENGE_BYTES = 32;

// Calculated Constants do not modify
export const ACCESS_TOKEN_EXPIRATION_MS = hoursToMilliseconds(
  ACCESS_TOKEN_EXPIRATION_HOURS,
);
