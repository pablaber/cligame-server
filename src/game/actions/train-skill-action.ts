import { ISkills } from '../../models/user/skills';
import {
  type ActionResult,
  type LevelRequirement,
  ActionBase,
  loadUserCheckRequirements,
} from './action-base';
import { upperFirst } from '../../utils/helpers';

type TrainSkillActionOptions = {
  energyCost?: number;
  label?: string;
  id?: string;
  levelRequirements?: LevelRequirement[];
};

export function TrainSkillAction(
  skill: keyof ISkills,
  options?: TrainSkillActionOptions,
): ActionBase {
  const { energyCost = 1, id, label, levelRequirements = [] } = options || {};
  const skillWithUpperFirst = upperFirst(skill);

  return {
    id: id || `train${skillWithUpperFirst}`,
    label: label || `Train ${skillWithUpperFirst}`,
    energyCost,
    requirements: levelRequirements,

    async execute(userId: string): Promise<ActionResult> {
      const [err, user] = await loadUserCheckRequirements(this, userId);
      if (err || !user) {
        return err as ActionResult;
      }

      user.skills[skill] = user.skills[skill] || { xp: 0 };
      user.skills[skill].xp += 10;

      user.energy.updateEnergy(-this.energyCost);
      await user.save();

      return { success: true, message: `${this.label} successful` };
    },
  };
}
