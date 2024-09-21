import { ActionBase, ActionResult } from './action-base';
import { User } from '../../models';
import { newEnemy, newRandomEnemy } from '../combat/enemies';
import { Player } from '../combat/Player';
import { Encounter } from '../combat/Encounter';
import type { Enemy } from '../combat/Enemy';
import { loadUserCheckRequirements } from './action-base';

type FightActionRequestBody = {
  enemyId?: string;
};

export const FightAction: ActionBase = {
  id: 'fight',
  label: 'Fight Enemy',
  energyCost: 5,
  requirements: [],

  async execute(
    userId: string,
    options?: FightActionRequestBody,
  ): Promise<ActionResult> {
    const [err, user] = await loadUserCheckRequirements(this, userId);
    if (err || !user) {
      return err as ActionResult;
    }

    if (user.health <= 0) {
      return { success: false, message: 'You are dead' };
    }

    const enemyId = options?.enemyId;

    let enemy: Enemy;
    if (enemyId) {
      enemy = newEnemy(enemyId);
    } else {
      enemy = newRandomEnemy();
    }

    if (!enemy) {
      return { success: false, message: 'Enemy not found' };
    }

    const player = Player.fromUser(user);
    const encounter = new Encounter(enemy, player);
    const result = await encounter.start();

    user.skills.strength.xp += result.xp;
    user.health = result.playerHealth;

    await user.save();

    return {
      success: result.playerWon,
      message: 'Encounter complete.',
      extraData: {
        log: result.log,
      },
    };
  },
};
