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
      name: user.character.name,
      health: user.character.getHealth(),
      strength: user.character.skills.strength.level,
      defense: user.character.skills.defense.level,
    });
  }

  constructor(options: PlayerOptions) {
    super(options);
  }
}
