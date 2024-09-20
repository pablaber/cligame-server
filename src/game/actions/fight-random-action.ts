import { ActionBase, ActionResult } from './action-base';
import { User } from '../../models';
import { newRandomEnemy } from '../combat/enemies';
import { Player } from '../combat/Player';
import { Encounter } from '../combat/Encounter';

export const FightRandomAction: ActionBase = {
  id: 'fightRandom',
  label: 'Fight Random Enemy',
  energyCost: 5,
  requirements: [],

  async execute(userId: string): Promise<ActionResult> {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const enemy = newRandomEnemy();
    const player = Player.fromUser(user);
    const encounter = new Encounter(enemy, player);
    const result = await encounter.start();
    return { success: result.playerWon, message: 'Encounter complete.' };
  },
};
