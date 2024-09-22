import { Context } from 'hono';
import { sign, verify } from 'hono/jwt';
import { randomBytes, createHash } from 'crypto';
import { millisecondsToSeconds } from 'date-fns';

import {
  ACCESS_TOKEN_EXPIRATION_MS,
  REFRESH_TOKEN_BYTES,
  EMAIL_CHALLENGE_BYTES,
} from '../constants/api-constants';
import { UnauthorizedError } from './errors';

type JwtPayload = {
  sub: string;
  refreshTokenId: string;
  email: string;
  userId: string;
  isVerified: boolean;
  iat: number;
  exp: number;
};

type GenerateAccessTokenOptions = {
  refreshTokenId: string;
  userId: string;
  email: string;
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
    userId: options.userId,
    isVerified: options.isVerified,
    iat: millisecondsToSeconds(now.getTime()),
    exp: millisecondsToSeconds(now.getTime() + ACCESS_TOKEN_EXPIRATION_MS),
  };
  return sign(payload, JWT_SIGNING_SECRET, 'HS256');
}

const UnauthorizedErrorWithContext = (context: any) =>
  new UnauthorizedError('The request is not authorized.', {
    privateContext: context,
  });

/**
 * Validates the authentication of a request.
 * @throws {UnauthorizedError} if the authentication is invalid
 */
export async function validateAuth(c: Context): Promise<JwtPayload> {
  const { JWT_SIGNING_SECRET } = process.env;
  if (!JWT_SIGNING_SECRET) {
    throw new Error('JWT_SIGNING_SECRET is not set');
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    throw UnauthorizedErrorWithContext({ reason: 'No Authorization Header' });
  }

  const [type, token] = authHeader.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    throw UnauthorizedErrorWithContext({
      reason: 'Invalid Authorization Type',
      type,
    });
  }

  let payload: JwtPayload;
  try {
    payload = (await verify(token, JWT_SIGNING_SECRET)) as JwtPayload;
  } catch (error: any) {
    let errorName = 'Unknown Error';
    if ('name' in error) {
      errorName = error.name;
    }

    throw UnauthorizedErrorWithContext({
      reason: 'JWT Validation Error',
      errorName,
      error,
    });
  }

  return payload;
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
