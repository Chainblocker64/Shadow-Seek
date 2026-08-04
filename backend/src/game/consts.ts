import { ActionTimestamps, CombatStats } from './combat/types';
import type { ObjectType } from './types';

export const WAITING = 'waiting';
export const RUNNING = 'running';
export const ENDED = 'ended';
export const GAME_START_DELAY_MS: number = 5_000;
export const GAME_DURATION_MS: number = 5 * 60_000;
export const MIN_PLAYERS_TO_START: number = 2;
export const SWIMMING_MOVEMENT_COOLDOWN_MS = 500;

export const WALKABLE_OBJECT_TYPES: ObjectType[] = ['spawn', 'bush', 'water'];

export const BLOCKING_OBJECT_TYPES: ObjectType[] = [
  'wall',
  'tree',
  'rock',
  'chest',
];

export const VIEW_BLOCKING_OBJECT_TYPES: ObjectType[] = [
  'wall',
  'tree',
  'rock',
];

export const DEFAULT_COMBAT_STATS: CombatStats = {
  maxHealth: 100,
  attackValue: 10,
  attackRange: 1,
  attackCooldown: 1000, //in miliseconds
};

export const DEFAULT_ACTION_TIMESTAMPS: ActionTimestamps = {
  attack: 0,
  movement: 0,
};

/**
 * The vision range defines the radius of the area which is fully visible for the player.
 * e.g. a vision range of 3 defines a visible square of 7x7 tiles with the player in the center
 */
export const DEFAULT_VISION_RANGE = 3;

export const PLAYER_STATUS_ALIVE = 'alive';
export const PLAYER_STATUS_DEFEATED = 'defeated';
