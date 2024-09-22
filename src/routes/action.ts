import { Hono } from 'hono';
import { validateAuth } from '../utils/auth-utils';
import { executeAction } from '../game/actions';
import { User } from '../models';
import { InternalServerError } from '../utils/errors';

const actionRouter = new Hono();

actionRouter.post('/:actionId', async (c) => {
  const { actionId } = c.req.param();
  let body;
  try {
    body = await c.req.json();
  } catch {}
  const auth = await validateAuth(c);

  const { userId } = auth;

  const result = await executeAction(actionId, userId, body);

  const user = await User.findById(userId);
  if (!user) {
    throw new InternalServerError({
      privateContext: {
        cause: 'User not found after action execution. This should not happen.',
        userId,
      },
    });
  }

  const extraData = result.extraData || {};
  const actionResult = {
    success: result.success,
    message: result.message,
  };

  return c.json(
    {
      action: { result: actionResult },
      user: user.toJSON(),
      ...extraData,
    },
    200,
  );
});

export default actionRouter;
