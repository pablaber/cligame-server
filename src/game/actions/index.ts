import { ActionBase, ActionResult } from './action-base';
import { TrainSkillAction } from './train-skill-action';
import { FightAction } from './fight-action';
import { HealAction } from './heal-action';
import { NotFoundError } from '../../utils/errors';

export const AllActions: ActionBase[] = [
  new HealAction(),
  new FightAction(),
  new TrainSkillAction('strength', { energyCost: 2 }),
  new TrainSkillAction('defense', { energyCost: 2 }),
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
  actionOptions?: Record<string, unknown>,
): Promise<ActionResult> {
  const action = actionsMap[actionId];
  if (!action) {
    throw new NotFoundError(`Action with ID ${actionId} not found`, {
      privateContext: {
        actionId,
      },
    });
  }

  return action.execute(userId, actionOptions);
}
