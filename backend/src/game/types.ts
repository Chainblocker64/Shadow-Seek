import { WAITING, RUNNING, ENDED } from './consts';
import type { RoomId } from '../shared/types';
import type { Player } from './player/player';

export type Status = typeof WAITING | typeof RUNNING | typeof ENDED;

export type Position = {
  x: number;
  y: number;
};

export type FacingDirection = 'up' | 'down' | 'left' | 'right';

export type GameMap = {
  name: string;
  width: number;
  height: number;
  baseTile: BaseTileType;
  baseOverrides: BaseTileOverride[];
  objects: MapObject[];
};

export type GameState = {
  roomId: RoomId;
  status: Status;
  map: GameMap;
  players: Player[];
  endsAt: number | null;
};

export const BASE_TILE_TYPES = [
  'floor',
  'grass',
  'dirt',
  'stoneFloor',
] as const;

export type BaseTileType = (typeof BASE_TILE_TYPES)[number];

export type BaseTileOverride = Position & {
  type: BaseTileType;
};

export const OBJECT_TYPES = [
  'wall',
  'tree',
  'rock',
  'spawn',
  'bush',
  'chest',
  'water',
] as const;

export type ObjectType = (typeof OBJECT_TYPES)[number];

export type MapObject = Position & {
  type: ObjectType;
};

export const MOVEMENT_DIRECTIONS = ['up', 'down', 'left', 'right'] as const;

export type MovementDirection = (typeof MOVEMENT_DIRECTIONS)[number];
