import { ISkills } from '../../models/user/skills';
import {
  type ActionResult,
  type LevelRequirement,
  ActionBase,
} from './action-base';
import { UserDocument } from '../../models/user/user';
import { upperFirst } from '../../utils/helpers';

type TrainSkillActionOptions = {
  energyCost?: number;
  label?: string;
  id?: string;
  levelRequirements?: LevelRequirement[];
};

export class TrainSkillAction extends ActionBase {
  skill: keyof ISkills;
  constructor(skill: keyof ISkills, options?: TrainSkillActionOptions) {
    super({
      id: `train${upperFirst(skill)}`,
      label: `Train ${upperFirst(skill)}`,
      energyCost: options?.energyCost || 1,
      requirements: options?.levelRequirements || [],
    });
    this.skill = skill;
  }

  async run(user: UserDocument): Promise<ActionResult> {
    user.character.skills[this.skill] = user.character.skills[this.skill] || {
      xp: 0,
    };
    user.character.skills[this.skill].xp += 10;

    return {
      success: true,
      message: `Your ${this.skill} skill increased by 10xp.`,
    };
  }
}
