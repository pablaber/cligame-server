import mongoose from 'mongoose';
import { getLevelForXp, getXpForLevel } from '../../utils/level-utils';

type ISkillsEntry = {
  xp: number;
  level: number;
};

const skillsEntry = new mongoose.Schema<ISkillsEntry>(
  {
    xp: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false },
);

skillsEntry.virtual('level').get(function () {
  return getLevelForXp(this.xp);
});

skillsEntry.virtual('xpToNextLevel').get(function () {
  return getXpForLevel(this.level + 1) - this.xp;
});

export type ISkills = {
  strength: ISkillsEntry;
  defense: ISkillsEntry;
};

export const DefaultSkills: ISkills = {
  strength: { xp: 0, level: 0 },
  defense: { xp: 0, level: 0 },
};

const skillsSchema = new mongoose.Schema<ISkills>(
  {
    strength: {
      type: skillsEntry,
      required: true,
      default: () => ({ xp: 0 }),
    },
    defense: {
      type: skillsEntry,
      required: true,
      default: () => ({ xp: 0 }),
    },
  },
  { _id: false },
);

export { skillsSchema };
