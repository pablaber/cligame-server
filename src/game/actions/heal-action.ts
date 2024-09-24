import { ActionBase, ActionResult } from './action-base';
import { HEALTH_MAX_BASE } from '../../constants/game-constants';
import { UserDocument } from '../../models/user/user';

/**
 * A heal action simply heals the user to full health by spending their energy.
 */
export class HealAction extends ActionBase {
  constructor() {
    super({
      id: 'heal',
      label: 'Heal',
      energyCost: 15,
    });
  }

  async run(user: UserDocument): Promise<ActionResult> {
    if (user.character.getHealth() >= HEALTH_MAX_BASE) {
      return { success: false, message: 'You already have full health.' };
    }

    const healthToHeal = HEALTH_MAX_BASE - user.character.getHealth();
    user.character.addHealth(healthToHeal);

    return {
      success: true,
      message: `You have been healed for ${healthToHeal} health points. You now have ${user.character.getHealth()} health.`,
    };
  }
}
