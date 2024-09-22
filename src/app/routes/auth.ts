import { Hono } from 'hono';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';

import { rateLimit } from '../../utils/rate-limit';
import { User, Token } from '../../models';
import {
  generateAccessToken,
  validateAuth,
  generatePasswordHash,
  generateEmailChallenge,
  generateRefreshToken,
} from '../../utils/auth-utils';
import {
  REFRESH_TOKEN_EXPIRATION_DAYS,
  PASSWORD_SALT_BYTES,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  REGISTER_RATE_LIMIT_LIMIT,
  REGISTER_RATE_LIMIT_WINDOW_MS,
  CHARACTER_NAME_MIN_LENGTH,
  CHARACTER_NAME_MAX_LENGTH,
} from '../../constants/api-constants';
import { validateJsonBody, validateQueryParams } from '../../utils/route-utils';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '../../utils/errors';
import type { HonoEnvironment } from '../../utils/types';

const authRouter = new Hono<HonoEnvironment>();

/**
 * Registers a new user.
 */
authRouter.post(
  '/register',
  rateLimit({
    limitInWindow: REGISTER_RATE_LIMIT_LIMIT,
    windowInMs: REGISTER_RATE_LIMIT_WINDOW_MS,
  }),
  validateJsonBody(
    z.object({
      characterName: z
        .string()
        .min(CHARACTER_NAME_MIN_LENGTH)
        .max(CHARACTER_NAME_MAX_LENGTH),
      email: z.string().email(),
      password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
    }),
  ),
  async (c) => {
    const body = await c.req.json<{
      email: string;
      password: string;
      characterName: string;
    }>();
    const { email, password, characterName } = body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email already exists');
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new BadRequestError('Email already exists');
    }

    const salt = randomBytes(PASSWORD_SALT_BYTES).toString('hex');
    const passwordHash = generatePasswordHash(password, salt);

    const user = new User({
      email,
      account: {
        passwordSalt: salt,
        passwordHash,
        emailChallenge: generateEmailChallenge(),
      },
      character: {
        name: characterName,
      },
    });
    await user.save();
    return c.json({ user: user.toJSON() });
  },
);

/**
 * Logs in a user.
 */
authRouter.post(
  '/login',
  validateJsonBody(
    z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  ),
  async (c) => {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();

    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { passwordSalt, passwordHash } = user.account;

    const calculatedPasswordHash = generatePasswordHash(password, passwordSalt);
    if (calculatedPasswordHash !== user.account.passwordHash) {
      throw new UnauthorizedError('Invalid password');
    }

    const token = new Token({
      refreshToken: generateRefreshToken(),
      expiresAt: addDays(new Date(), REFRESH_TOKEN_EXPIRATION_DAYS),
      lastUsed: new Date(),
      userId: user._id,
    });

    await token.save();

    const accessToken = await generateAccessToken({
      refreshTokenId: token._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      isVerified: user.account.isVerified,
    });

    return c.json({
      user: user.toJSON(),
      tokens: {
        accessToken,
        refreshToken: token.refreshToken,
      },
    });
  },
);

/**
 * Verifies a user's email.
 */
authRouter.get(
  '/verify-email',
  validateQueryParams(
    z.object({
      email: z.string().email(),
      challenge: z.string(),
    }),
  ),
  async (c) => {
    const { email, challenge } = c.req.query();

    const GENERIC_UNAUTHORIZED_MESSAGE =
      "You're probably doing something you shouldn't be.";

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError(GENERIC_UNAUTHORIZED_MESSAGE, {
        privateContext: { cause: 'User not found', email, challenge },
      });
    }

    if (user.account.emailChallenge !== challenge) {
      throw new UnauthorizedError(GENERIC_UNAUTHORIZED_MESSAGE, {
        privateContext: { cause: 'Invalid challenge', email, challenge },
      });
    }

    delete user.account.emailChallenge;
    user.account.isVerified = true;

    await user.save();

    return c.json({ user: user.toJSON() });
  },
);

/**
 * Refreshes the access token.
 */
authRouter.post(
  '/refresh',
  validateJsonBody(
    z.object({
      refreshToken: z.string(),
    }),
  ),
  async (c) => {
    const { refreshToken } = await c.req.json<{ refreshToken: string }>();

    const GENERIC_UNAUTHORIZED_MESSAGE =
      "You're probably doing something you shouldn't be.";

    const token = await Token.findOne({ refreshToken });
    if (!token) {
      throw new UnauthorizedError(GENERIC_UNAUTHORIZED_MESSAGE, {
        privateContext: { cause: 'Refresh token not found', refreshToken },
      });
    }

    if (token.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh Token Expired', {
        privateContext: {
          cause: 'Refresh token expired',
          tokenId: token._id,
          refreshToken,
          expiresAt: token.expiresAt,
        },
      });
    }

    const user = await User.findById(token.userId);
    if (!user) {
      throw new InternalServerError({
        privateContext: {
          cause:
            'User associated with refresh token not found. This should never happen.',
          userId: token.userId,
          tokenId: token._id,
          refreshToken,
        },
      });
    }

    const accessToken = await generateAccessToken({
      refreshTokenId: token._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      isVerified: user.account.isVerified,
    });

    token.lastUsed = new Date();
    await token.save();

    return c.json({ accessToken });
  },
);

authRouter.post('/logout', async (c) => {
  const auth = await validateAuth(c);
  const { refreshTokenId } = auth;
  const token = await Token.findById(refreshTokenId);
  if (!token) {
    throw new NotFoundError('Token not found');
  }

  await token.deleteOne();

  return c.json({ message: 'Logged out successfully' });
});

export default authRouter;
