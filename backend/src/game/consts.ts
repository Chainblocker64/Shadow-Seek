import type { ObjectType } from './types';

export const WAITING = 'waiting';
export const RUNNING = 'running';

export const WALKABLE_OBJECT_TYPES: ObjectType[] = ['spawn', 'bush'];

export const BLOCKING_OBJECT_TYPES: ObjectType[] = [
  'wall',
  'tree',
  'rock',
  'chest',
  'water',
];
