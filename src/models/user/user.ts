import mongoose from 'mongoose';
import { skillsSchema } from './skills';
import { energySchema } from './energy';
import {
  ENERGY_MAX,
  HEALTH_MAX_BASE,
  MONEY_STARTING,
} from '../../constants/game-constants';
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

  money: number;
  health: number;
  energy: IEnergy;
  skills: ISkills;

  addMoney: (amount: number) => void;
  removeMoney: (amount: number) => void;

  addHealth: (amount: number) => void;
  removeHealth: (amount: number) => void;
  setHealth: (amount: number) => void;
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
    money: {
      type: Number,
      required: true,
      default: MONEY_STARTING,
    },
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
  {
    timestamps: true,
    methods: {
      addMoney: function (amount: number) {
        this.money += amount;
      },
      removeMoney: function (amount: number) {
        this.money -= amount;
      },
      addHealth: function (amount: number) {
        this.health += amount;
      },
      removeHealth: function (amount: number) {
        this.health -= amount;
      },
      setHealth: function (amount: number) {
        this.health = amount;
      },
    },
  },
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
