import mongoose from 'mongoose';
import { addMilliseconds, differenceInMilliseconds } from 'date-fns';
import { boundValue } from '../../utils/app-utils';

type CreateRegeneratingValueSchemaOptions = {
  regenerateTickMs: number;
  maxValue: number;
  minValue?: number;
};

type RegenRateInfo = {
  valueAtUpdate: number;
  lastUpdate: Date;
  nextTick: number;
};

export type IRegeneratingValue = {
  // Stored Fields
  valueAtUpdate: number;
  lastUpdate: Date;
  nextTick: number;

  // Virtuals
  current: number;
  nextTickDate: Date;

  // Methods
  value: () => number;
  add: (amount: number) => void;
  subtract: (amount: number) => void;
  getNextTick: () => number;
};

/**
 * Creates a generic regenerating value schema with the supplied options.
 */
export function createRegeneratingValueSchema(
  createOptions: CreateRegeneratingValueSchemaOptions,
) {
  const { regenerateTickMs, maxValue, minValue = 0 } = createOptions;

  /**
   * Gets the current value of the regenerating value.
   */
  function getCurrentValue(getCurrentValueOptions: RegenRateInfo) {
    const { valueAtUpdate, lastUpdate, nextTick } = getCurrentValueOptions;

    const timeSinceLastUpdateMs = differenceInMilliseconds(
      new Date(),
      lastUpdate,
    );
    let ticksSinceLastUpdate = Math.floor(
      timeSinceLastUpdateMs / regenerateTickMs,
    );
    const remainderMs = timeSinceLastUpdateMs % regenerateTickMs;
    if (remainderMs + nextTick > regenerateTickMs) {
      ticksSinceLastUpdate += 1;
    }

    const value = valueAtUpdate + ticksSinceLastUpdate;

    return boundValue(value, [minValue, maxValue]);
  }

  /**
   * Adds the value to the regenerating value and returns the updated fields.
   * @param addValueOptions
   * @param amount
   * @returns
   */
  function addValue(addValueOptions: RegenRateInfo, amount: number) {
    const now = new Date();

    const nextTickValue = getNextTickValue(addValueOptions);
    const currentValue = getCurrentValue(addValueOptions);
    const newValueAtUpdate = boundValue(currentValue + amount, [
      minValue,
      maxValue,
    ]);
    const newLastUpdate = now;
    const newNextTick = newValueAtUpdate === maxValue ? 0 : nextTickValue;

    return {
      newValueAtUpdate,
      newLastUpdate,
      newNextTick,
    };
  }

  /**
   * Gets the next tick value of the regenerating value.
   */
  function getNextTickValue(getCurrentValueOptions: RegenRateInfo) {
    const { lastUpdate, nextTick } = getCurrentValueOptions;

    const now = new Date();

    const previousNextTickDate = addMilliseconds(lastUpdate, nextTick);
    const currentTickValueMs = differenceInMilliseconds(
      now,
      previousNextTickDate,
    );
    const nextTickValue =
      (regenerateTickMs - (currentTickValueMs % regenerateTickMs)) %
      regenerateTickMs;

    return nextTickValue;
  }

  const regeneratingValueSchema = new mongoose.Schema<IRegeneratingValue>(
    {
      valueAtUpdate: {
        type: Number,
        required: true,
        default: maxValue,
      },
      lastUpdate: {
        type: Date,
        required: true,
        default: new Date(),
      },
      nextTick: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    {
      _id: false,
      methods: {
        value: function () {
          return getCurrentValue({
            valueAtUpdate: this.valueAtUpdate,
            lastUpdate: this.lastUpdate,
            nextTick: this.nextTick,
          });
        },
        add: function (amount: number) {
          const { newValueAtUpdate, newLastUpdate, newNextTick } = addValue(
            {
              valueAtUpdate: this.valueAtUpdate,
              lastUpdate: this.lastUpdate,
              nextTick: this.nextTick,
            },
            amount,
          );
          this.valueAtUpdate = newValueAtUpdate;
          this.lastUpdate = newLastUpdate;
          this.nextTick = newNextTick;
        },
        subtract: function (amount: number) {
          this.add(-amount);
        },
        getNextTick: function () {
          return getNextTickValue({
            lastUpdate: this.lastUpdate,
            nextTick: this.nextTick,
            valueAtUpdate: this.valueAtUpdate,
          });
        },
      },
    },
  );

  regeneratingValueSchema.virtual('current').get(function () {
    return this.value();
  });

  regeneratingValueSchema.virtual('nextTickDate').get(function () {
    const currentValue = this.value();
    if (currentValue === maxValue) {
      return null;
    }
    return addMilliseconds(new Date(), this.nextTick);
  });

  regeneratingValueSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.valueAtUpdate;
      delete ret.lastUpdate;
      delete ret.nextTick;
      return ret;
    },
  });

  return { regeneratingValueSchema, getCurrentValue, addValue };
}
