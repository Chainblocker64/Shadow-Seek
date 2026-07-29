import type { ClientId } from '../../shared/types';
import type { ActionTimestamps, CombatStats } from '../combat/types';
import { DEFAULT_ACTION_TIMESTAMPS, DEFAULT_COMBAT_STATS } from '../consts';
import type { FacingDirection, Position } from '../types';

export class Player {
  public readonly clientId: ClientId;
  private position: Position;
  private combatStats: CombatStats;
  private health: number;
  private facingDirection: FacingDirection;
  private actionTimestamps: ActionTimestamps = DEFAULT_ACTION_TIMESTAMPS;

  constructor({
    clientId,
    position,
    combatStats = DEFAULT_COMBAT_STATS,
    facingDirection = 'down',
  }: {
    clientId: ClientId;
    position: Position;
    combatStats?: CombatStats;
    facingDirection?: FacingDirection;
  }) {
    this.clientId = clientId;
    this.position = position;
    this.combatStats = combatStats;
    this.health = this.combatStats.maxHealth;
    this.facingDirection = facingDirection;
  }

  canAct() {
    return this.isAlive();
  }

  takeDamage(amount: number) {
    this.health -= amount;
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

  getCombatStats(): CombatStats {
    return this.combatStats;
  }

  getFacingDirection(): FacingDirection {
    return this.facingDirection;
  }

  getActionTimestamps(): ActionTimestamps {
    return this.actionTimestamps;
  }

  setActionTimestamps(actionTimestamps: ActionTimestamps) {
    this.actionTimestamps = actionTimestamps;
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
