import { EnemyOptions, Enemy } from './Enemy';

export const enemiesMap: Record<string, EnemyOptions> = {
  mouse: {
    name: 'Mouse',
    level: 1,
    health: 10,
    strength: 1,
    defense: 0,
    money: [1, 5],
    xp: 10,
  },
  turtle: {
    name: 'Turtle',
    level: 2,
    health: 20,
    strength: 2,
    defense: 5,
    money: [3, 10],
    xp: 20,
  },
} as const;

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function newEnemy(enemyId: string): Enemy | null {
  const enemyOptions = enemiesMap[enemyId];
  if (!enemyOptions) {
    return null;
  }
  return new Enemy(enemyOptions);
}

export function newRandomEnemy(): Enemy {
  const enemyName = randomChoice(Object.keys(enemiesMap));
  const enemyOptions = enemiesMap[enemyName];
  return new Enemy(enemyOptions);
}
