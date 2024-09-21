import {
  ActionBase,
  ActionResult,
  loadUserCheckRequirements,
} from './action-base';
import { HEALTH_MAX_BASE } from '../../constants/game-constants';

export const HealAction: ActionBase = {
  id: 'heal',
  label: 'Heal',
  energyCost: 15,
  requirements: [],

  async execute(userId: string): Promise<ActionResult> {
    const [err, user] = await loadUserCheckRequirements(this, userId);
    if (err || !user) {
      return err as ActionResult;
    }

    if (user.health >= HEALTH_MAX_BASE) {
      return { success: false, message: 'You have full health' };
    }

    user.health = HEALTH_MAX_BASE;
    user.energy.updateEnergy(-this.energyCost);
    await user.save();

    return { success: true, message: 'You have been healed' };
  },
};
