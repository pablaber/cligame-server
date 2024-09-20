import { Hono } from 'hono';

import { validateAuth } from '../utils/auth-utils';
import { User } from '../models';
import { AllActions } from '../game/actions';
import {
  actionToJSON,
  meetsActionLevelRequirements,
} from '../game/actions/action-base';

const tavernRouter = new Hono();

tavernRouter.get('/', async (c) => {
  const [err, auth] = await validateAuth(c);
  if (err) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const { userId } = auth;

  const user = await User.findById(userId);
  if (!user) {
    return c.json({ message: 'User not found' }, 404);
  }

  const { skills } = user;
  const availableActions = AllActions.filter((a) =>
    meetsActionLevelRequirements(a, skills),
  );

  const actionsJSON = availableActions.map(actionToJSON);

  return c.json({ user: user.toJSON(), actions: actionsJSON });
});

export default tavernRouter;
