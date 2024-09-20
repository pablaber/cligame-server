type FighterOptions = {
  name: string;
  health: number;
  strength: number;
  defense: number;
};

export class Fighter {
  name: string;
  health: number;
  strength: number;
  defense: number;

  constructor(options: FighterOptions) {
    this.name = options.name;
    this.health = options.health;
    this.strength = options.strength;
    this.defense = options.defense;
  }

  attackBase() {
    return Math.ceil(Math.pow(this.strength, 1.2));
  }

  defenseBase() {
    return Math.floor(Math.pow(this.defense / 2, 0.9));
  }

  combatLevel() {
    return Math.floor((this.strength + this.defense) / 2);
  }

  combatLogInfo() {
    return {
      name: this.name,
      health: this.health,
    };
  }

  takeDamage(amount: number) {
    this.health -= amount;
    return this;
  }

  heal(amount: number) {
    this.health += amount;
    return this;
  }

  isAlive() {
    return this.health > 0;
  }

  isDead() {
    return this.health <= 0;
  }
}
