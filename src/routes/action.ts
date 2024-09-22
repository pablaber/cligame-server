import { Hono } from 'hono';
import { type StatusCode } from 'hono/utils/http-status';

import { validateAuth } from '../utils/auth-utils';
import { executeAction } from '../game/actions';
import { User } from '../models';
import { NotFoundError } from '../utils/errors';

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
    throw new NotFoundError('User not found');
  }

  let statusCode = 200 as StatusCode;
  const extraData = result.extraData || {};
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
      ...extraData,
    },
    statusCode,
  );
});

export default actionRouter;
