import { Fighter } from './Fighter';
import type { NumRange } from '../../utils/types';
import { randomInRange } from '../../utils/app-utils';

export type EnemyOptions = {
  name: string;
  level: number;
  health: number;
  strength: NumRange;
  defense: NumRange;
  money: NumRange;
  xp: number;
};

export class Enemy extends Fighter {
  level: number;
  xp: number;
  money: number;

  constructor(options: EnemyOptions) {
    const {
      level,
      xp,
      money: moneyRange,
      strength: strengthRange,
      defense: defenseRange,
      ...fighterOptions
    } = options;

    super({
      ...fighterOptions,
      strength: randomInRange(strengthRange),
      defense: randomInRange(defenseRange),
    });
    this.level = level;
    this.xp = xp;
    this.money = randomInRange(moneyRange);
  }
}
