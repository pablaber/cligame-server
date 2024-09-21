import type { Document, Types } from 'mongoose';
import type { StatusCode } from 'hono/utils/http-status';
import type { ISkills } from '../../models/user/skills';
import { User } from '../../models';
import type { IUser } from '../../models/user/user';
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

export type LevelRequirement = {
  type: 'minimum' | 'maximum' | 'exact';
  level: number;
  skill: keyof ISkills;
};

export interface ActionBase {
  id: string;
  label: string;
  description?: string;
  energyCost: number;
  requirements?: LevelRequirement[];
  execute: (userId: string, ...args: any[]) => Promise<ActionResult>;
}

export function meetsActionLevelRequirements(
  action: ActionBase,
  skills: ISkills,
) {
  const { requirements = [] } = action;
  return requirements.every((requirement) => {
    const { skill, type, level } = requirement;
    const userLevel = skills[skill];
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

export function meetsActionEnergyRequirements(
  action: ActionBase,
  currentEnergy: number,
) {
  return currentEnergy >= action.energyCost || 0;
}

export function actionToJSON(action: ActionBase) {
  return {
    id: action.id,
    label: action.label,
    description: action.description,
    energyCost: action.energyCost,
    requirements: action.requirements,
  };
}

type UserDocument =
  | (Document<unknown, {}, IUser> &
      IUser & {
        _id: Types.ObjectId;
      })
  | null;
type LoadUserCheckRequirementsResult =
  | [null, UserDocument]
  | [ActionResult, null];

export async function loadUserCheckRequirements(
  action: ActionBase,
  userId: string,
): Promise<LoadUserCheckRequirementsResult> {
  const user = await User.findById(userId);
  if (!user) {
    return [{ success: false, message: 'User not found' }, null];
  }

  if (!meetsActionLevelRequirements(action, user.skills)) {
    return [
      {
        success: false,
        message: 'User does not meet action level requirements',
        code: 403,
      },
      null,
    ];
  }

  if (!meetsActionEnergyRequirements(action, user.energy.currentEnergy)) {
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
