import { ISkills } from '../../models/user/skills';
import {
  type ActionResult,
  type LevelRequirement,
  ActionBase,
  meetsActionLevelRequirements,
  meetsActionEnergyRequirements,
} from './action-base';
import { upperFirst } from '../../utils/helpers';
import { User } from '../../models';

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
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (!meetsActionLevelRequirements(this, user.skills)) {
        return {
          success: false,
          message: 'User does not meet action requirements',
          code: 403,
        };
      }

      if (!meetsActionEnergyRequirements(this, user.energy.currentEnergy)) {
        return {
          success: false,
          message: 'User does not meet action energy requirements',
          code: 403,
        };
      }

      user.skills[skill] = user.skills[skill] || { xp: 0 };
      user.skills[skill].xp += 10;

      user.energy.updateEnergy(-this.energyCost);
      await user.save();

      return { success: true, message: `${this.label} successful` };
    },
  };
}
