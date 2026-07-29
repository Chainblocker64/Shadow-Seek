import { ClientId } from '../../shared/types';
import { CombatStats } from '../combat/types';
import { DEFAULT_COMBAT_STATS, DEFAULT_VISION_RANGE } from '../consts';
import { Position } from '../types';

export class Player {
  public readonly clientId: ClientId;
  private position: Position;
  private combatStats: CombatStats;
  private health: number;
  private visionRange: number;

  constructor({
    clientId,
    position,
    combatStats = DEFAULT_COMBAT_STATS,
    visionRange = DEFAULT_VISION_RANGE,
  }: {
    clientId: ClientId;
    position: Position;
    combatStats?: CombatStats;
    visionRange?: number;
  }) {
    this.clientId = clientId;
    this.position = position;
    this.combatStats = combatStats;
    this.health = this.combatStats.maxHealth;
    this.visionRange = visionRange;
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

  getVisionRange(): number {
    return this.visionRange;
  }

  setVisionRange(visionRange: number) {
    this.visionRange = visionRange;
  }
}
