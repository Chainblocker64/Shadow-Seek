import type { ClientId } from '../../shared/types';
import type { ActionTimestamps, CombatStats } from '../combat/types';
import type {
  FacingDirection,
  PlayerStatus,
  Position,
  PublicPlayerState,
} from '../types';
import {
  DEFAULT_COMBAT_STATS,
  DEFAULT_VISION_RANGE,
  DEFAULT_ACTION_TIMESTAMPS,
  PLAYER_STATUS_ALIVE,
  PLAYER_STATUS_DEFEATED,
} from '../consts';
import { canAttack } from '../combat/combat-validation';

export class Player {
  public readonly clientId: ClientId;
  public readonly name: string;
  public readonly spriteIndex: number;
  private position: Position;
  private combatStats: CombatStats;
  private health: number;
  private visionRange: number;
  private facingDirection: FacingDirection;
  private activeAction: string | null = null;
  private actionTimestamps: ActionTimestamps = DEFAULT_ACTION_TIMESTAMPS;
  private status: PlayerStatus = PLAYER_STATUS_ALIVE;

  constructor({
    clientId,
    name,
    position,
    spriteIndex = 0,
    combatStats = DEFAULT_COMBAT_STATS,
    visionRange = DEFAULT_VISION_RANGE,
    facingDirection = 'down',
  }: {
    clientId: ClientId;
    name: string;
    position: Position;
    spriteIndex?: number;
    combatStats?: CombatStats;
    visionRange?: number;
    facingDirection?: FacingDirection;
  }) {
    this.clientId = clientId;
    this.name = name;
    this.spriteIndex = spriteIndex;
    this.position = position;
    this.combatStats = combatStats;
    this.health = this.combatStats.maxHealth;
    this.visionRange = visionRange;
    this.facingDirection = facingDirection;
  }

  canAct() {
    return this.isAlive() && this.status !== PLAYER_STATUS_DEFEATED;
  }

  takeDamage(amount: number) {
    if (amount > this.health) {
      this.health = 0;
    } else {
      this.health -= amount;
    }

    if (this.health === 0) {
      this.status = PLAYER_STATUS_DEFEATED;
    }
  }

  isAlive(): boolean {
    return this.health > 0;
  }

  getHealth(): number {
    return this.health;
  }

  isHandlingAction(): boolean {
    return Boolean(this.activeAction);
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

  getActiveAction(): string | null {
    return this.activeAction;
  }

  setActiveAction(actionName: string | null): void {
    this.activeAction = actionName;
  }

  canAttack(): boolean {
    return canAttack(this);
  }

  toPublicState(): PublicPlayerState {
    return {
      id: this.clientId,
      name: this.name,
      health: this.health,
      maxHealth: this.combatStats.maxHealth,
    };
  }

  toJSON() {
    return {
      ...this.toPublicState(),
      spriteIndex: this.spriteIndex,
      position: this.position,
      facingDirection: this.facingDirection,
      visionRange: this.visionRange,
      status: this.status,
    };
  }
}
