import { Enemy } from './Enemy';
import { Fighter } from './Fighter';
import { Player } from './Player';
import {
  CHANCE_TO_HIT_BASE,
  HIT_CHANCE_PER_LEVEL,
  COMBAT_EXHAUSTION_LEVEL,
} from '../../constants/game-constants';

function rollChance(chance: number): boolean {
  return Math.random() < chance;
}

function rollDamage(baseDamage: number): number {
  return Math.ceil(Math.random() * baseDamage);
}

function rollDefense(baseDefense: number): number {
  return Math.floor(Math.random() * baseDefense);
}

type DamageResult = {
  damage: number;
  result: 'hit' | 'miss';
  // isCritical: boolean;
};

function calculateDamage(attacker: Fighter, defender: Fighter): DamageResult {
  const attackerCombatLevel = attacker.combatLevel();
  const defenderCombatLevel = defender.combatLevel();
  const levelDifference = attackerCombatLevel - defenderCombatLevel;
  const chanceToHit =
    CHANCE_TO_HIT_BASE + levelDifference * HIT_CHANCE_PER_LEVEL;
  const isHit = rollChance(chanceToHit);
  if (!isHit) return { damage: 0, result: 'miss' };

  const baseDamage = rollDamage(attacker.attackBase());
  const baseDefense = rollDefense(defender.defenseBase());
  const damage = Math.max(baseDamage - baseDefense, 0);
  return { damage, result: 'hit' };
}

type LogEntryBase = {
  type: 'start' | 'hit' | 'miss' | 'end';
  enemy: {
    name: string;
    health: number;
  };
  player: {
    name: string;
    health: number;
  };
};

type StartLogEntry = LogEntryBase & {
  type: 'start';
};

type DamageLogEntry = LogEntryBase & {
  type: 'hit' | 'miss';
  attacker: 'enemy' | 'player';
  damage: number;
};

type EndLogEntry = LogEntryBase & {
  type: 'end';
  result: 'playerWon' | 'enemyWon' | 'draw';
  xp: number;
};

type EncounterLogEntry = StartLogEntry | DamageLogEntry | EndLogEntry;

function logEntryToString(entry: EncounterLogEntry): string {
  if (entry.type === 'start') {
    return `Combat starts! You encountered a ${entry.enemy.name} with ${entry.enemy.health} HP and you have ${entry.player.health} HP.`;
  }

  if (entry.type === 'end') {
    if (entry.result === 'playerWon') {
      return `You defeated the ${entry.enemy.name}! You gained ${entry.xp} XP.`;
    }
    if (entry.result === 'enemyWon') {
      return `The ${entry.enemy.name} defeated you.`;
    }
    return 'You both got exhausted and gave up.';
  }

  const typeToVerb = (type: 'hit' | 'miss') => {
    if (type === 'hit') {
      return 'hit';
    }
    return 'missed';
  };

  const attacker = entry.attacker === 'enemy' ? entry.enemy : entry.player;
  const defender = entry.attacker === 'enemy' ? entry.player : entry.enemy;
  return `${attacker.name} ${typeToVerb(entry.type)} ${defender.name} for ${entry.damage} damage. ${defender.name} has ${defender.health} HP remaining`;
}

export class Encounter {
  enemy: Enemy;
  player: Player;
  log: EncounterLogEntry[] = [];

  constructor(enemy: Enemy, player: Player) {
    this.enemy = enemy;
    this.player = player;
  }

  private addCombatLogEntry(
    type: 'start' | 'hit' | 'miss',
    attacker: 'enemy' | 'player',
    damage: number,
  ) {}

  start() {
    // TODO: add speed to determine who goes first
    let attacker: Fighter = this.player;
    let defender: Fighter = this.enemy;
    let countdown = COMBAT_EXHAUSTION_LEVEL;

    this.log.push({
      type: 'start',
      player: this.player.combatLogInfo(),
      enemy: this.enemy.combatLogInfo(),
    });

    while (this.player.isAlive() && this.enemy.isAlive() && countdown > 0) {
      countdown--;
      const damageResult = calculateDamage(attacker, defender);

      if (damageResult.result === 'hit') {
        defender.takeDamage(damageResult.damage);
      }
      this.log.push({
        type: damageResult.result,
        attacker: attacker === this.player ? 'player' : 'enemy',
        damage: damageResult.damage,
        enemy: this.enemy.combatLogInfo(),
        player: this.player.combatLogInfo(),
      });

      [attacker, defender] = [defender, attacker];
    }

    const playerWon = this.player.isAlive() && this.enemy.isDead();
    const enemyWon = this.enemy.isAlive() && this.player.isDead();
    const draw = this.enemy.isAlive() && this.player.isAlive();

    let result: 'playerWon' | 'enemyWon' | 'draw' = 'draw';
    if (playerWon) result = 'playerWon';
    if (enemyWon) result = 'enemyWon';

    const xp = playerWon ? this.enemy.xp : 0;

    this.log.push({
      type: 'end',
      result,
      xp,
      enemy: this.enemy.combatLogInfo(),
      player: this.player.combatLogInfo(),
    });

    this.log.forEach((entry) => {
      console.log(logEntryToString(entry));
    });

    return {
      playerWon,
      enemyWon,
      draw,
      xp,
    };
  }
}
