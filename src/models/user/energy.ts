import mongoose from 'mongoose';

import {
  ENERGY_REGEN_RATE_MS,
  ENERGY_MAX,
} from '../../constants/game-constants';

function calculateCurrentEnergy(
  lastEnergy: number,
  timestamp?: Date,
  nextTick?: Date,
) {
  const now = new Date();

  let currentEnergy = lastEnergy;
  let newNextTick = nextTick;
  let lastEnergyTimestamp = timestamp || now;
  if (nextTick) {
    // Next tick is in the future, so we don't change it
    if (nextTick > now) {
      newNextTick = nextTick;
    } else {
      // Next tick is in the past, so we update it

      // Calculate the difference that has elapsed since the last next tick
      const nextTickDiff = now.getTime() - nextTick.getTime();

      // Calculate the extra time over the regen rate
      const extraTime = nextTickDiff % ENERGY_REGEN_RATE_MS;

      // Calculate the time remaining until the next tick
      const timeRemaining = ENERGY_REGEN_RATE_MS - extraTime;

      // The new next tick is the current time plus the time remaining until the next tick
      newNextTick = new Date(now.getTime() + timeRemaining);
    }
  } else {
    newNextTick = new Date(now.getTime() + ENERGY_REGEN_RATE_MS);
  }
  if (nextTick && nextTick < now) {
    lastEnergyTimestamp = nextTick;
    currentEnergy += 1;
  }

  const diffMs = now.getTime() - lastEnergyTimestamp.getTime();

  const regen = Math.floor(diffMs / ENERGY_REGEN_RATE_MS);

  const newCurrentEnergy = Math.min(currentEnergy + regen, ENERGY_MAX);

  return {
    currentEnergy: newCurrentEnergy,
    nextTick: newNextTick,
  };
}

export type IEnergy = {
  lastEnergy: number;
  timestamp?: Date;
  nextTick?: Date;
  currentEnergy: number;
  updateEnergy: (energyDifference: number) => void;
};

const energySchema = new mongoose.Schema<IEnergy>(
  {
    lastEnergy: {
      type: Number,
      required: true,
      default: ENERGY_MAX,
    },
    timestamp: {
      type: Date,
      required: false,
    },
    nextTick: {
      type: Date,
      required: false,
    },
  },
  {
    _id: false,
    methods: {
      updateEnergy(energyDifference: number) {
        const now = new Date();
        const { currentEnergy, nextTick } = calculateCurrentEnergy(
          this.lastEnergy,
          this.timestamp ?? undefined,
          this.nextTick ?? undefined,
        );
        this.lastEnergy = currentEnergy + energyDifference;
        this.nextTick = nextTick;
        this.timestamp = now;
      },
    },
  },
);

energySchema.virtual('currentEnergy').get(function () {
  const { currentEnergy } = calculateCurrentEnergy(
    this.lastEnergy,
    this.timestamp ?? undefined,
    this.nextTick ?? undefined,
  );
  return currentEnergy;
});

energySchema.set('toJSON', {
  virtuals: true,
});

export { energySchema };
