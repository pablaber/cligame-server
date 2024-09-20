import { Hono } from 'hono';
import { type StatusCode } from 'hono/utils/http-status';

import { validateAuth } from '../utils/auth-utils';
import { executeAction } from '../game/actions';
import { User } from '../models';

const actionRouter = new Hono();

actionRouter.post('/:actionId', async (c) => {
  const { actionId } = c.req.param();
  const [err, auth] = await validateAuth(c);
  if (err) {
    return c.json({ message: 'Unauthorized' }, 401);
  }
  const { userId } = auth;

  const result = await executeAction(actionId, userId);

  const user = await User.findById(userId);
  if (!user) {
    return c.json({ message: 'User not found' }, 404);
  }

  let statusCode = 200 as StatusCode;
  if (!result.success) {
    statusCode = result.code || 400;
  }
  const actionResult = {
    success: result.success,
    message: result.message,
  };

  return c.json(
    {
      action: { result: actionResult },
      user: user.toJSON(),
    },
    statusCode,
  );
});

export default actionRouter;
