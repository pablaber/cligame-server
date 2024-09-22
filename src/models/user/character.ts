import mongoose from 'mongoose';

import {
  MONEY_STARTING,
  HEALTH_MAX_BASE,
} from '../../constants/game-constants';
import { energySchema, IEnergy } from './energy';
import { skillsSchema, ISkills } from './skills';

export type ICharacter = {
  name: string;
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

const characterSchema = new mongoose.Schema<ICharacter>(
  {
    name: {
      type: String,
      required: true,
    },
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
    _id: false,
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

export { characterSchema };
