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

export const DEFAULT_COMBAT_STATS: CombatStats = {
  maxHealth: 100,
  attack: 10,
  attackRange: 1,
};

export const DEFAULT_VISION_RANGE = 3;
