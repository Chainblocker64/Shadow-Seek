import { CombatStats } from './combat/types';
import type { ObjectType } from './types';

export const WAITING = 'waiting';
export const RUNNING = 'running';
export const GAME_START_DELAY_MS: number = 3_000;
export const MIN_PLAYERS_TO_START: number = 2;

export const WALKABLE_OBJECT_TYPES: ObjectType[] = ['spawn', 'bush'];

export const BLOCKING_OBJECT_TYPES: ObjectType[] = [
  'wall',
  'tree',
  'rock',
  'chest',
  'water',
];

export const VIEW_BLOCKING_OBJECT_TYPES: ObjectType[] = [
  'wall',
  'tree',
  'rock',
];

export const DEFAULT_COMBAT_STATS: CombatStats = {
  maxHealth: 100,
  attack: 10,
  attackRange: 1,
};

/**
 * The vision range defines the radius of the area which is fully visible for the player.
 * e.g. a vision range of 3 defines a visible square of 7x7 tiles with the player in the center
 */
export const DEFAULT_VISION_RANGE = 3;
