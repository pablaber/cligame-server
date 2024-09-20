import { Context } from 'hono';
import { sign, verify } from 'hono/jwt';
import { randomBytes, createHash } from 'crypto';
import { millisecondsToSeconds } from 'date-fns';

import {
  ACCESS_TOKEN_EXPIRATION_MS,
  REFRESH_TOKEN_BYTES,
  EMAIL_CHALLENGE_BYTES,
} from '../constants/api-constants';

type JwtPayload = {
  sub: string;
  refreshTokenId: string;
  email: string;
  username: string;
  userId: string;
  isVerified: boolean;
  iat: number;
  exp: number;
};

type GenerateAccessTokenOptions = {
  refreshTokenId: string;
  userId: string;
  email: string;
  username: string;
  isVerified: boolean;
};

/**
 * Generates an access token.
 */
export function generateAccessToken(options: GenerateAccessTokenOptions) {
  const { JWT_SIGNING_SECRET } = process.env;
  if (!JWT_SIGNING_SECRET) {
    throw new Error('JWT_SIGNING_SECRET is not set');
  }

  const now = new Date();
  const payload: JwtPayload = {
    sub: options.userId,
    refreshTokenId: options.refreshTokenId,
    email: options.email,
    username: options.username,
    userId: options.userId,
    isVerified: options.isVerified,
    iat: millisecondsToSeconds(now.getTime()),
    exp: millisecondsToSeconds(now.getTime() + ACCESS_TOKEN_EXPIRATION_MS),
  };
  return sign(payload, JWT_SIGNING_SECRET, 'HS256');
}

type ValidateError = {
  error: string;
};

type ValidateAuthResponse = [ValidateError, null] | [null, JwtPayload];

export async function validateAuth(c: Context): Promise<ValidateAuthResponse> {
  const { JWT_SIGNING_SECRET } = process.env;
  if (!JWT_SIGNING_SECRET) {
    throw new Error('JWT_SIGNING_SECRET is not set');
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return [{ error: 'Unauthorized' }, null];
  }

  const [type, token] = authHeader.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return [{ error: 'Unauthorized' }, null];
  }

  let payload: JwtPayload;
  try {
    payload = (await verify(token, JWT_SIGNING_SECRET)) as JwtPayload;
  } catch (error: any) {
    let errorName = 'Unknown Error';
    if ('name' in error) {
      errorName = error.name;
    }

    console.log('JWT Validation Error:', errorName);
    return [{ error: 'Unauthorized' }, null];
  }

  return [null, payload];
}

/**
 * Generates a refresh token.
 */
export function generateRefreshToken() {
  return randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

/**
 * Generates a random email challenge.
 */
export function generateEmailChallenge() {
  return randomBytes(EMAIL_CHALLENGE_BYTES).toString('hex');
}

/**
 * Generates a password hash using the SHA-256 algorithm.
 */
export function generatePasswordHash(password: string, salt: string) {
  return createHash('sha256')
    .update(password + salt)
    .digest('hex');
}
