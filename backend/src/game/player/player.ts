import { ClientId } from '../../shared/types';
import { CombatStats } from '../combat/types';
import { Position } from '../types';

export class Player {
  private health: number;

  constructor(
    public readonly id: ClientId,
    private position: Position,
    private combatStats: CombatStats,
  ) {
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
