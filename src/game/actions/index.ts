import { ActionBase, ActionResult } from './action-base';
import { TrainSkillAction } from './train-skill-action';
import { FightAction } from './fight-action';
import { HealAction } from './heal-action';

export const AllActions: ActionBase[] = [
  new HealAction(),
  new FightAction(),
  new TrainSkillAction('strength', { energyCost: 3 }),
  new TrainSkillAction('defense', { energyCost: 3 }),
];

const actionsMap = AllActions.reduce(
  (acc, action) => {
    acc[action.id] = action;
    return acc;
  },
  {} as Record<string, ActionBase>,
);

export async function executeAction(
  actionId: string,
  userId: string,
  actionOptions?: Record<string, any>,
): Promise<ActionResult> {
  const action = actionsMap[actionId];
  if (!action) {
    return { success: false, message: 'Action not found', code: 404 };
  }

  return action.execute(userId, actionOptions);
}
