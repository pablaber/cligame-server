import {
  LEVEL_XP_SCALING_X,
  LEVEL_XP_SCALING_Y,
} from '../constants/game-constants';

/**
 * Returns the XP required to reach the next level.
 */
export function getXpForLevel(level: number) {
  if (level < 1) {
    return 0;
  }
  const levelAdjusted = level - 1;
  const baseBeforeScale = levelAdjusted / LEVEL_XP_SCALING_X;
  const scaledXp = Math.pow(baseBeforeScale, LEVEL_XP_SCALING_Y);
  const roundedXp = Math.round(scaledXp / 10) * 10;
  return roundedXp;
}

/**
 * Returns the level for a given amount of XP.
 */
export function getLevelForXp(xp: number) {
  if (xp < 0) {
    return 0;
  }
  const level = 1 + LEVEL_XP_SCALING_X * Math.pow(xp, 1 / LEVEL_XP_SCALING_Y);
  const levelFloor = Math.floor(level);
  const levelCeil = Math.ceil(level);

  if (xp >= getXpForLevel(levelCeil)) {
    return levelCeil;
  }
  return levelFloor;
}
