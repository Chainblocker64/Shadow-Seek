import type { ClientId } from '../../shared/types';
import type { CombatStats } from '../combat/types';
import type { FacingDirection, Position } from '../types';
import { DEFAULT_COMBAT_STATS, DEFAULT_VISION_RANGE } from '../consts';

export class Player {
  public readonly clientId: ClientId;
  private position: Position;
  private combatStats: CombatStats;
  private health: number;
  private visionRange: number;
  private facingDirection: FacingDirection;

  constructor({
    clientId,
    position,
    combatStats = DEFAULT_COMBAT_STATS,
    visionRange = DEFAULT_VISION_RANGE,
    facingDirection = 'down',
  }: {
    clientId: ClientId;
    position: Position;
    combatStats?: CombatStats;
    visionRange?: number;
    facingDirection?: FacingDirection;
  }) {
    this.clientId = clientId;
    this.position = position;
    this.combatStats = combatStats;
    this.health = this.combatStats.maxHealth;
    this.visionRange = visionRange;
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

  getVisionRange(): number {
    return this.visionRange;
  }

  setVisionRange(visionRange: number): void {
    this.visionRange = visionRange;
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
