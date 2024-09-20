import type { ISkills } from '../models/user/skills';
import type { StatusCode } from 'hono/utils/http-status';

export type ActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
      code?: StatusCode;
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
