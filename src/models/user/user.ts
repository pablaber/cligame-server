import mongoose from 'mongoose';
import { skillsSchema } from './skills';
import { energySchema } from './energy';
import { ENERGY_MAX, HEALTH_MAX_BASE } from '../../constants/game-constants';
import { ISkills } from './skills';
import { IEnergy } from './energy';
import type { Document, Types } from 'mongoose';

export type IUser = {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  isVerified: boolean;
  emailChallenge?: string;

  health: number;
  energy: IEnergy;
  skills: ISkills;
};

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
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
      required: false,
    },

    // Skills and stats
    health: {
      type: Number,
      required: true,
      default: HEALTH_MAX_BASE,
    },
    energy: {
      type: energySchema,
      required: true,
      default: () => ({}),
    },
    skills: {
      type: skillsSchema,
      required: true,
      default: () => ({}),
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
    delete ret.passwordHash;
    delete ret.passwordSalt;
    delete ret.emailChallenge;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export type UserDocument = Document<unknown, {}, IUser> &
  IUser & {
    _id: Types.ObjectId;
  };

export default User;
