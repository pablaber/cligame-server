import mongoose from 'mongoose';

export type IAccount = {
  passwordHash: string;
  passwordSalt: string;
  isVerified: boolean;
  emailChallenge?: string;
};

const accountSchema = new mongoose.Schema<IAccount>(
  {
    passwordHash: {
      type: String,
      required: true,
    },
    passwordSalt: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailChallenge: {
      type: String,
    },
  },
  { _id: false },
);

export { accountSchema };
