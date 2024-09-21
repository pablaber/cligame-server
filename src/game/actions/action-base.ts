import type { Document, Types } from 'mongoose';
import type { StatusCode } from 'hono/utils/http-status';
import type { ISkills } from '../../models/user/skills';
import { User } from '../../models';
import type { UserDocument } from '../../models/user/user';

export type ActionResult =
  | {
      success: true;
      message: string;
      extraData?: Record<string, any>;
    }
  | {
      success: false;
      message: string;
      code?: StatusCode;
      extraData?: Record<string, any>;
    };

type LoadUserCheckRequirementsResult =
  | [null, UserDocument]
  | [ActionResult, null];

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
    this.requirements = options.requirements;
  }

  private meetsActionLevelRequirements(user: UserDocument): boolean {
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
  async verifyMeetsRequirements(
    userId: string,
  ): Promise<LoadUserCheckRequirementsResult> {
    const user = await User.findById(userId);
    // TODO: fatal vs non fatal
    if (!user) {
      return [{ success: false, message: 'User not found' }, null];
    }

    if (!this.meetsActionLevelRequirements(user)) {
      return [
        {
          success: false,
          message: 'User does not meet action level requirements',
          code: 403,
        },
        null,
      ];
    }

    if (!this.meetsActionEnergyRequirements(user)) {
      return [
        {
          success: false,
          message: 'User does not meet action energy requirements',
          code: 403,
        },
        null,
      ];
    }

    return [null, user];
  }

  async run(user: UserDocument, options?: any): Promise<ActionResult> {
    throw new Error('Method not yet implemented.');
  }

  async execute(userId: string, options?: any): Promise<ActionResult> {
    const [err, user] = await this.verifyMeetsRequirements(userId);
    if (err || !user) {
      return err as ActionResult;
    }

    const result = await this.run(user, options);

    if (result.success) {
      user.energy.updateEnergy(-this.energyCost);
    }

    await user.save();

    return result;
  }
}
