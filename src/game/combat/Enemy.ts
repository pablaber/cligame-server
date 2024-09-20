import { Fighter } from './Fighter';

export type EnemyOptions = {
  name: string;
  level: number;
  health: number;
  strength: number;
  defense: number;
  xp: number;
};

export class Enemy extends Fighter {
  level: number;
  xp: number;

  constructor(options: EnemyOptions) {
    const { level, xp, ...fighterOptions } = options;
    super(fighterOptions);
    this.level = level;
    this.xp = xp;
  }
}
