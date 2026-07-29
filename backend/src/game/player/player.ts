import type { ClientId } from '../../shared/types';
import type { CombatStats } from '../combat/types';
import { DEFAULT_COMBAT_STATS } from '../consts';
import type { FacingDirection, Position } from '../types';

export class Player {
  public readonly clientId: ClientId;
  public readonly name: string;
  private position: Position;
  private combatStats: CombatStats;
  private health: number;
  private facingDirection: FacingDirection;

  constructor({
    clientId,
    name,
    position,
    combatStats = DEFAULT_COMBAT_STATS,
    facingDirection = 'down',
  }: {
    clientId: ClientId;
    name: string;
    position: Position;
    combatStats?: CombatStats;
    facingDirection?: FacingDirection;
  }) {
    this.clientId = clientId;
    this.name = name;
    this.position = position;
    this.combatStats = combatStats;
    this.health = this.combatStats.maxHealth;
    this.facingDirection = facingDirection;
  }

  isAlive(): boolean {
    return this.health > 0;
  }

  getPosition(): Position {
    return this.position;
  }

  setPosition(position: Position): void {
    this.position = position;
  }

  getFacingDirection(): FacingDirection {
    return this.facingDirection;
  }

  setFacingDirection(direction: FacingDirection): void {
    this.facingDirection = direction;
  }

  toJSON() {
    return {
      id: this.clientId,
      position: this.position,
      facingDirection: this.facingDirection,
    };
  }
}
