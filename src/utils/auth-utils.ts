import { Context } from 'hono';
import { sign, verify } from 'hono/jwt';
import { randomBytes, createHash } from 'crypto';

const ACCESS_TOKEN_EXPIRATION_HOURS = 1;

type JwtPayload = {
  sub: string;
  refreshTokenId: string;
  email: string;
  username: string;
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

  const payload: JwtPayload = {
    sub: options.userId,
    refreshTokenId: options.refreshTokenId,
    email: options.email,
    username: options.username,
    isVerified: options.isVerified,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRATION_HOURS * 60 * 60,
  };
  return sign(payload, JWT_SIGNING_SECRET, 'HS256');
}

type ValidateError = {
  error: string;
}

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
    payload = await verify(token, JWT_SIGNING_SECRET) as JwtPayload;
  } catch (error) {
    console.error(error);
    throw error;
  }

  return [null, payload];
}

/**
 * Generates a refresh token.
 */
export function generateRefreshToken() {
  return randomBytes(32).toString('hex');
}

/**
 * Generates a random email challenge.
 */
export function generateEmailChallenge() {
  return randomBytes(32).toString('hex');
}

/**
 * Generates a password hash using the SHA-256 algorithm.
 */
export function generatePasswordHash(password: string, salt: string) {
  return createHash('sha256')
    .update(password + salt)
    .digest('hex');
}