import { IUser } from '../../models/user/user';
import { Fighter } from './Fighter';

type PlayerOptions = {
  name: string;
  health: number;
  strength: number;
  defense: number;
};

export class Player extends Fighter {
  static fromUser(user: IUser) {
    return new Player({
      // TODO: update to character name
      name: user.email,
      health: user.health,
      strength: user.skills.strength.level,
      defense: user.skills.defense.level,
    });
  }

  constructor(options: PlayerOptions) {
    super(options);
  }
}
