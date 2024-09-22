import { Hono } from 'hono';

import { validateAuth } from '../utils/auth-utils';
import { User } from '../models';
import { AllActions } from '../game/actions';
import { NotFoundError } from '../utils/errors';

const tavernRouter = new Hono();

tavernRouter.get('/', async (c) => {
  const auth = await validateAuth(c);
  const { userId } = auth;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const availableActions = AllActions.filter((a) =>
    a.meetsActionLevelRequirements(user),
  );

  const actionsJSON = availableActions.map((a) => a.toJSON());
  return c.json({ user: user.toJSON(), actions: actionsJSON });
});

export default tavernRouter;
