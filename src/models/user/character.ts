import mongoose from 'mongoose';

import {
  MONEY_STARTING,
  HEALTH_MAX_BASE,
  ENERGY_REGEN_RATE_MS,
  ENERGY_MAX,
} from '../../constants/game-constants';
import {
  createRegeneratingValueSchema,
  IRegeneratingValue,
} from './regenerating-value';
import { skillsSchema, ISkills } from './skills';

export type ICharacter = {
  name: string;
  money: number;
  health: number;

  energy: IRegeneratingValue;
  skills: ISkills;

  // Methods
  getEnergy: () => number;
  addEnergy: (amount: number) => void;
  removeEnergy: (amount: number) => void;

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
      type: createRegeneratingValueSchema({
        regenerateTickMs: ENERGY_REGEN_RATE_MS,
        maxValue: ENERGY_MAX,
        minValue: 0,
      }).regeneratingValueSchema,
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
      getEnergy: function () {
        return this.energy.value();
      },
      addEnergy: function (amount: number) {
        this.energy.add(amount);
      },
      removeEnergy: function (amount: number) {
        this.energy.subtract(amount);
      },

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
