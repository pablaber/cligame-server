import mongoose from 'mongoose';

import {
  MONEY_STARTING,
  HEALTH_MAX_BASE,
  ENERGY_REGEN_RATE_MS,
  ENERGY_MAX,
  HEALTH_REGEN_RATE_MS,
} from '../../constants/game-constants';
import {
  createRegeneratingValueSchema,
  IRegeneratingValue,
} from './regenerating-value';
import { skillsSchema, ISkills } from './skills';

export type ICharacter = {
  name: string;
  money: number;

  health: IRegeneratingValue;
  energy: IRegeneratingValue;
  skills: ISkills;

  // Methods
  getEnergy: () => number;
  addEnergy: (amount: number) => void;
  removeEnergy: (amount: number) => void;

  getHealth: () => number;
  addHealth: (amount: number) => void;
  removeHealth: (amount: number) => void;

  addMoney: (amount: number) => void;
  removeMoney: (amount: number) => void;
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
      type: createRegeneratingValueSchema({
        regenerateTickMs: HEALTH_REGEN_RATE_MS,
        maxValue: HEALTH_MAX_BASE,
        minValue: 0,
      }).regeneratingValueSchema,
      required: true,
      default: () => ({}),
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
      // Energy
      getEnergy: function () {
        return this.energy.value();
      },
      addEnergy: function (amount: number) {
        this.energy.add(amount);
      },
      removeEnergy: function (amount: number) {
        this.energy.subtract(amount);
      },

      // Health
      getHealth: function () {
        return this.health.value();
      },
      addHealth: function (amount: number) {
        this.health.add(amount);
      },
      removeHealth: function (amount: number) {
        this.health.subtract(amount);
      },

      addMoney: function (amount: number) {
        this.money += amount;
      },
      removeMoney: function (amount: number) {
        this.money -= amount;
      },
    },
  },
);

export { characterSchema };
