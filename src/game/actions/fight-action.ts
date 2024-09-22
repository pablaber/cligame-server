import { ActionBase, ActionResult } from './action-base';
import { newEnemy, newRandomEnemy } from '../combat/enemies';
import { Player } from '../combat/Player';
import { Encounter } from '../combat/Encounter';
import type { Enemy } from '../combat/Enemy';
import { UserDocument } from '../../models/user/user';

type FightActionOptions = {
  enemyId?: string;
};

/**
 * Fights an enemy and rewards the user with XP and other rewards.
 */
export class FightAction extends ActionBase {
  constructor() {
    super({
      id: 'fight',
      label: 'Fight Enemy',
      energyCost: 5,
      requirements: [],
    });
  }

  async run(
    user: UserDocument,
    options?: FightActionOptions,
  ): Promise<ActionResult> {
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
    const encounterResult = await encounter.start();

    user.skills.strength.xp += encounterResult.xp;
    user.skills.defense.xp += Math.floor(encounterResult.xp / 2);
    user.health = Math.max(encounterResult.playerHealth, 0);

    return {
      success: encounterResult.playerWon,
      message: 'Encounter complete.',
      extraData: {
        log: encounterResult.log,
      },
    };
  }
}
