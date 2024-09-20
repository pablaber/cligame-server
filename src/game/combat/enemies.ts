import { EnemyOptions, Enemy } from './Enemy';

export const enemiesMap: Record<string, EnemyOptions> = {
  mouse: {
    name: 'mouse',
    level: 1,
    health: 10,
    strength: 1,
    defense: 0,
    xp: 10,
  },
  turtle: {
    name: 'turtle',
    level: 2,
    health: 20,
    strength: 2,
    defense: 5,
    xp: 20,
  },
};

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function newRandomEnemy(): Enemy {
  const enemyName = randomChoice(Object.keys(enemiesMap));
  const enemyOptions = enemiesMap[enemyName];
  console.log(enemyOptions);
  return new Enemy(enemyOptions);
}
