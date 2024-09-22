import { Fighter } from './Fighter';
import type { NumRange } from '../../utils/types';

export type EnemyOptions = {
  name: string;
  level: number;
  health: number;
  strength: number;
  defense: number;
  money: NumRange;
  xp: number;
};

export class Enemy extends Fighter {
  level: number;
  xp: number;
  money: NumRange;

  constructor(options: EnemyOptions) {
    const { level, xp, money, ...fighterOptions } = options;
    super(fighterOptions);
    this.level = level;
    this.xp = xp;
    this.money = money;
  }
}
