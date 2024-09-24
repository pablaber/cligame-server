import mongoose from 'mongoose';
import { randomBytes } from 'crypto';
import { afterAll, beforeAll, afterEach, beforeEach } from 'vitest';
import { User, Token } from '../src/models';
import {
  generatePasswordHash,
  generateRefreshToken,
  generateAccessToken,
} from '../src/utils/auth-utils';
import { PASSWORD_SALT_BYTES } from '../src/constants/api-constants';
import { addDays } from 'date-fns';
import { UserDocument } from '../src/models/user/user';
import {
  ENERGY_REGEN_RATE_MS,
  HEALTH_REGEN_RATE_MS,
} from '../src/constants/game-constants';

const TEST_MONGO_URI =
  'mongodb://root:example@localhost:27017/test?authSource=admin';

type TestUserOptions = {
  email?: string;
  password?: string;
  characterName?: string;
  characterMoney?: number;
  characterHealth?: number;
  characterEnergy?: number;
  characterSkills?: {
    strengthXp?: number;
    defenseXp?: number;
  };
};
async function createTestUser(options?: TestUserOptions) {
  const passwordSalt = randomBytes(PASSWORD_SALT_BYTES).toString('hex');
  const passwordHash = generatePasswordHash(
    options?.password || 'password',
    passwordSalt,
  );
  const user = new User({
    email: options?.email || 'test@example.com',
    account: {
      passwordHash,
      passwordSalt,
    },
    character: {
      name: options?.characterName || 'Test Character',
      money: options?.characterMoney,
      health: options?.characterHealth
        ? {
            valueAtUpdate: options.characterHealth,
            lastUpdate: new Date(),
            nextTick: HEALTH_REGEN_RATE_MS,
          }
        : undefined,
      energy: options?.characterEnergy
        ? {
            valueAtUpdate: options.characterEnergy,
            lastUpdate: new Date(),
            nextTick: ENERGY_REGEN_RATE_MS,
          }
        : undefined,
      skills: {
        strength: { xp: options?.characterSkills?.strengthXp },
        defense: { xp: options?.characterSkills?.defenseXp },
      },
    },
  });
  await user.save();
  return user;
}

type TestTokenOptions = {
  userId: string;
};

async function createTestToken(options: TestTokenOptions) {
  const token = new Token({
    refreshToken: generateRefreshToken(),
    lastUsed: new Date(),
    expiresAt: addDays(new Date(), 1),
    userId: options.userId,
  });
  await token.save();
  return token;
}

export function createTestDatabase(userOptions?: TestUserOptions[]) {
  const testUserOptions = userOptions || [{}];
  let accessTokens: string[] = [];

  let users: UserDocument[] = [];

  beforeAll(async () => {
    await mongoose.connect(TEST_MONGO_URI);
  });

  beforeEach(async () => {
    const users = await Promise.all(
      testUserOptions.map((userOptions) => createTestUser(userOptions)),
    );
    const tokens = await Promise.all(
      users.map((user) => createTestToken({ userId: user._id.toString() })),
    );

    accessTokens = await Promise.all(
      tokens.map((token) => {
        const tokenUser = users.find(
          (u) => u._id.toString() === token.userId.toString(),
        );
        if (!tokenUser) {
          throw new Error(
            'Could not find token user. This should never happen.',
          );
        }
        return generateAccessToken({
          refreshTokenId: token._id.toString(),
          userId: tokenUser._id.toString(),
          email: tokenUser.email,
          isVerified: true,
        });
      }),
    );
  });

  afterEach(async () => {
    await mongoose.connection.dropCollection('users');
    await mongoose.connection.dropCollection('tokens');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  function getAccessToken(userId?: string) {
    let index = 0;
    if (userId) {
      index = users.findIndex((u) => u._id.toString() === userId);
    }
    return accessTokens[index];
  }

  function generateAuthHeadersObject(userId?: string) {
    return {
      Authorization: `Bearer ${getAccessToken(userId)}`,
    };
  }

  return {
    getAccessToken,
    generateAuthHeadersObject,
  };
}
