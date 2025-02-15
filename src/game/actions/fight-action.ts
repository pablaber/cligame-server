import { ActionBase, ActionResult } from './action-base';
import { newEnemy, newRandomEnemy } from '../combat/enemies';
import { Player } from '../combat/Player';
import { Encounter } from '../combat/Encounter';
import type { Enemy } from '../combat/Enemy';
import { UserDocument } from '../../models/user/user';
import { NotFoundError } from '../../utils/errors';

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
      const enemyFromOptions = newEnemy(enemyId);
      if (!enemyFromOptions) {
        throw new NotFoundError(`Enemy with ID "${enemyId}" not found`, {
          privateContext: {
            cause: 'Enemy not found',
            enemyId,
          },
        });
      }
      enemy = enemyFromOptions;
    } else {
      enemy = newRandomEnemy();
    }

    const player = Player.fromUser(user);
    const startingHealth = user.character.getHealth();
    const encounter = new Encounter(enemy, player);
    const encounterResult = await encounter.start();
    const endingHealth = encounterResult.playerHealth;

    user.character.skills.strength.xp += encounterResult.xp;
    user.character.skills.defense.xp += Math.floor(encounterResult.xp / 2);
    user.character.removeHealth(startingHealth - endingHealth);
    user.character.addMoney(enemy.money);

    let message: string;
    if (encounterResult.playerWon) {
      message = `You fought a ${enemy.name} and gained ${encounterResult.xp} XP`;
      if (enemy.money > 0) {
        message += ` and ${enemy.money} gold.`;
      } else {
        message += '.';
      }
    } else {
      message = `You fought a ${enemy.name} and lost.`;
    }

    message += ` You have ${user.character.health} health remaining.`;

    return {
      success: true,
      message,
      extraData: {
        encounterLog: encounterResult.log,
      },
    };
  }
}
