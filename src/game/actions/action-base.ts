import type { StatusCode } from 'hono/utils/http-status';
import type { ISkills } from '../../models/user/skills';
import { User } from '../../models';
import type { UserDocument } from '../../models/user/user';
import { ForbiddenError, InternalServerError } from '../../utils/errors';

export type ActionResult = {
  success: boolean;
  message: string;
  extraData?: Record<string, any>;
};

export type LevelRequirement = {
  type: 'minimum' | 'maximum' | 'exact';
  level: number;
  skill: keyof ISkills;
};

type ActionBaseOptions = {
  id: string;
  label: string;
  description?: string;
  energyCost: number;
  requirements?: LevelRequirement[];
};

export class ActionBase {
  id: string;
  label: string;
  description?: string;
  energyCost: number;
  requirements?: LevelRequirement[];

  constructor(options: ActionBaseOptions) {
    this.id = options.id;
    this.label = options.label;
    this.description = options.description;
    this.energyCost = options.energyCost;
    this.requirements = options.requirements || [];
  }

  meetsActionLevelRequirements(user: UserDocument): boolean {
    const { requirements = [] } = this;
    return requirements.every((requirement) => {
      const { skill, type, level } = requirement;
      const userLevel = user.skills[skill];
      switch (type) {
        case 'minimum':
          return userLevel.level >= level;
        case 'maximum':
          return userLevel.level <= level;
        case 'exact':
          return userLevel.level === level;
        default:
          return false;
      }
    });
  }

  private meetsActionEnergyRequirements(user: UserDocument): boolean {
    return user.energy.currentEnergy >= this.energyCost;
  }

  toJSON() {
    return {
      id: this.id,
      label: this.label,
      description: this.description,
      energyCost: this.energyCost,
      requirements: this.requirements,
    };
  }

  /**
   * Check if the user meets the requirements for the action. Returns the user
   * if they meet the requirements, otherwise returns an error.
   */
  async verifyMeetsRequirements(userId: string): Promise<UserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new InternalServerError({
        privateContext: {
          cause: 'User not found. This should not happen.',
          userId,
        },
      });
    }

    if (!this.meetsActionLevelRequirements(user)) {
      throw new ForbiddenError('User does not meet action level requirements', {
        privateContext: {
          cause: 'User does not meet action level requirements',
          userId,
          userSkills: user.skills,
          actionRequirements: this.requirements,
        },
      });
    }

    if (!this.meetsActionEnergyRequirements(user)) {
      throw new ForbiddenError(
        'User does not meet action energy requirements',
        {
          privateContext: {
            cause: 'User does not meet action energy requirements',
            userId,
            userEnergy: user.energy,
            actionEnergyCost: this.energyCost,
          },
        },
      );
    }

    return user;
  }

  async run(user: UserDocument, options?: any): Promise<ActionResult> {
    throw new Error('Method not yet implemented.');
  }

  async execute(userId: string, options?: any): Promise<ActionResult> {
    const user = await this.verifyMeetsRequirements(userId);

    const result = await this.run(user, options);

    if (result.success) {
      user.energy.updateEnergy(-this.energyCost);
    }

    await user.save();

    return result;
  }
}
