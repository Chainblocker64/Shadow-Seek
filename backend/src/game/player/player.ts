import { ClientId } from '../../shared/types';
import { CombatStats } from '../combat/types';
import { DEFAULT_COMBAT_STATS } from '../consts';
import { Position } from '../types';

export class Player {
  public readonly clientId: ClientId;
  public readonly name: string;
  private position: Position;
  private combatStats: CombatStats;
  private health: number;

  constructor({
    clientId,
    name,
    position,
    combatStats = DEFAULT_COMBAT_STATS,
  }: {
    clientId: ClientId;
    name: string;
    position: Position;
    combatStats?: CombatStats;
  }) {
    this.clientId = clientId;
    this.name = name;
    this.position = position;
    this.combatStats = combatStats;
    this.health = this.combatStats.maxHealth;
  }

  isAlive(): boolean {
    return this.health > 0;
  }

  getPosition(): Position {
    return this.position;
  }

  setPosition(position: Position) {
    this.position = position;
  }
}
