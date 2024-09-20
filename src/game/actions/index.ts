import { ActionBase, ActionResult } from './action-base';
import { TrainSkillAction } from './train-skill-action';
import { FightRandomAction } from './fight-random-action';
export const AllActions: ActionBase[] = [
  FightRandomAction,
  TrainSkillAction('strength', { energyCost: 3 }),
  TrainSkillAction('defense', { energyCost: 3 }),
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
): Promise<ActionResult> {
  const action = actionsMap[actionId];
  if (!action) {
    return { success: false, message: 'Action not found', code: 404 };
  }

  return action.execute(userId);
}
