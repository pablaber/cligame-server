import { Hono } from 'hono';
import { validateAuth } from '../../utils/auth-utils';
import { executeAction } from '../../game/actions';
import { User } from '../../models';
import { InternalServerError } from '../../utils/errors';
import { HonoEnvironment } from '../../utils/types';

const actionRouter = new Hono<HonoEnvironment>();

actionRouter.post('/:actionId', async (c) => {
  const { actionId } = c.req.param();
  const body = await c.req.json();
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
