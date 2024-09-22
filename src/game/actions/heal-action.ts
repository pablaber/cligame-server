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
      return { success: false, message: 'You already have full health.' };
    }

    const healthToHeal = HEALTH_MAX_BASE - user.health;
    user.health = HEALTH_MAX_BASE;

    return {
      success: true,
      message: `You have been healed for ${healthToHeal} health points. You now have ${user.health} health.`,
    };
  }
}
