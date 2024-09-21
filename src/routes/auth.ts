import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';
import { User, Token } from '../models';
import {
  generateAccessToken,
  validateAuth,
  generatePasswordHash,
  generateEmailChallenge,
  generateRefreshToken,
} from '../utils/auth-utils';
import {
  REFRESH_TOKEN_EXPIRATION_DAYS,
  PASSWORD_SALT_BYTES,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../constants/api-constants';
import { validateJsonBody, validateQueryParams } from '../utils/route-utils';

const authRouter = new Hono();

/**
 * Registers a new user.
 */
authRouter.post(
  '/register',
  validateJsonBody(
    z.object({
      username: z.string().min(USERNAME_MIN_LENGTH).max(USERNAME_MAX_LENGTH),
      email: z.string().email(),
      password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
    }),
  ),
  async (c) => {
    const body = await c.req.json();
    if (!body.username || !body.email || !body.password) {
      return c.json({ message: 'Missing required fields' }, 400);
    }

    const { username, email, password } = body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return c.json({ message: 'Username already exists' }, 400);
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return c.json({ message: 'Email already exists' }, 400);
    }

    const salt = randomBytes(PASSWORD_SALT_BYTES).toString('hex');
    const passwordHash = generatePasswordHash(password, salt);

    try {
      const user = new User({
        username,
        email,
        passwordHash,
        passwordSalt: salt,
        emailChallenge: generateEmailChallenge(),
      });
      await user.save();
      console.log('User registered successfully', user);
      return c.json({ user: user.toJSON() });
    } catch (error) {
      if (error instanceof Error && 'message' in error) {
        return c.json(
          { message: 'Error registering user', error: error.message },
          500,
        );
      }
      return c.json({ message: 'Error registering user', error: error }, 500);
    }
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
      password: z.string().min(8),
    }),
  ),
  async (c) => {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();

    const user = await User.findOne({ email });
    if (!user) {
      return c.json({ message: 'User not found' }, 404);
    }

    const passwordHash = generatePasswordHash(password, user.passwordSalt);
    if (passwordHash !== user.passwordHash) {
      return c.json({ message: 'Invalid password' }, 401);
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
      username: user.username,
      isVerified: user.isVerified,
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

    const user = await User.findOne({ email });
    if (!user) {
      return c.json({ message: 'User not found' }, 404);
    }

    if (user.emailChallenge !== challenge) {
      return c.json({ message: 'Invalid challenge' }, 401);
    }

    delete user.emailChallenge;
    user.isVerified = true;

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

    const token = await Token.findOne({ refreshToken });
    if (!token) {
      return c.json({ message: 'Invalid refresh token' }, 401);
    }

    if (token.expiresAt < new Date()) {
      return c.json({ message: 'Refresh token expired' }, 401);
    }

    const user = await User.findById(token.userId);
    if (!user) {
      return c.json({ message: 'User not found' }, 404);
    }

    const accessToken = await generateAccessToken({
      refreshTokenId: token._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      isVerified: user.isVerified,
    });

    token.lastUsed = new Date();
    await token.save();

    return c.json({ accessToken });
  },
);

authRouter.post('/logout', async (c) => {
  const [err, auth] = await validateAuth(c);
  if (err) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const { refreshTokenId } = auth;
  const token = await Token.findById(refreshTokenId);
  if (!token) {
    return c.json({ message: 'Token not found' }, 404);
  }

  await token.deleteOne();

  return c.json({ message: 'Logged out successfully' });
});

export default authRouter;
