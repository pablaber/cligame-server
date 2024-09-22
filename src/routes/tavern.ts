import { Hono } from 'hono';

import { validateAuth } from '../utils/auth-utils';
import { User } from '../models';
import { AllActions } from '../game/actions';

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

  const availableActions = AllActions.filter((a) =>
    a.meetsActionLevelRequirements(user),
  );

  const actionsJSON = availableActions.map((a) => a.toJSON());
  return c.json({ user: user.toJSON(), actions: actionsJSON });
});

export default tavernRouter;
