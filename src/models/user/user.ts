import mongoose from 'mongoose';
import { accountSchema, type IAccount } from './account';
import { characterSchema, type ICharacter } from './character';
import type { Document, Types } from 'mongoose';

export type IUser = {
  id: string;
  email: string;

  account: IAccount;
  character: ICharacter;

  addMoney: (amount: number) => void;
  removeMoney: (amount: number) => void;

  addHealth: (amount: number) => void;
  removeHealth: (amount: number) => void;
  setHealth: (amount: number) => void;
};

const userSchema = new mongoose.Schema<IUser>(
  {
    // Main index fields
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Account Related Fields
    account: {
      type: accountSchema,
      required: true,
    },

    // Skills and stats
    character: {
      type: characterSchema,
      required: true,
    },
  },
  { timestamps: true },
);

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.account;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export type UserDocument = Document<unknown, unknown, IUser> &
  IUser & {
    _id: Types.ObjectId;
  };

export default User;
