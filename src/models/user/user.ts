import mongoose from 'mongoose';
import { skillsSchema, type ISkills } from './skills';
import { energySchema, type IEnergy } from './energy';
import { accountSchema, type IAccount } from './account';
import {
  HEALTH_MAX_BASE,
  MONEY_STARTING,
} from '../../constants/game-constants';
import type { Document, Types } from 'mongoose';

export type IUser = {
  id: string;
  email: string;

  account: IAccount;

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
    delete ret.account;
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
