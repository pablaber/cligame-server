import { ActionBase, ActionResult } from './action-base';
import { HEALTH_MAX_BASE } from '../../constants/game-constants';
import { UserDocument } from '../../models/user/user';

export class HealAction extends ActionBase {
  constructor() {
    super({
      id: 'heal',
      label: 'heal',
      energyCost: 15,
    });
  }

  async run(user: UserDocument): Promise<ActionResult> {
    if (user.health >= HEALTH_MAX_BASE) {
      return { success: false, message: 'You have full health' };
    }

    user.health = HEALTH_MAX_BASE;

    return { success: true, message: 'You have been healed' };
  }
}
