import { test, expect } from 'vitest';
import { getXpForLevel, getLevelForXp } from './level-utils';

test('getXpForLevel', () => {
  expect(getXpForLevel(-1), 'XP for level -1').toBe(0);
  expect(getXpForLevel(0), 'XP for level 0').toBe(0);

  const xpForLevelExpected = [
    0, 120, 370, 700, 1110, 1580, 2120, 2720, 3360, 4060,
  ];
  for (let i = 0; i < xpForLevelExpected.length; i++) {
    expect(getXpForLevel(i + 1), `XP for level ${i}`).toBe(
      xpForLevelExpected[i],
    );
  }
});

test('getLevelForXp', () => {
  expect(getLevelForXp(-1), 'Level for XP -1').toBe(0);
  expect(getLevelForXp(0), 'Level for XP 0').toBe(1);
  expect(getLevelForXp(50), 'Level for XP 50').toBe(1);
  expect(getLevelForXp(120), 'Level for XP 120').toBe(2);
  expect(getLevelForXp(200), 'Level for XP 200').toBe(2);
  expect(getLevelForXp(3000), 'Level for XP 3000').toBe(8);
  expect(getLevelForXp(10000), 'Level for XP 10000').toBe(16);
});
