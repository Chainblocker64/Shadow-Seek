import { WAITING, RUNNING } from './consts';
import type { ClientId, RoomId } from '../shared/types';

export type Status = typeof WAITING | typeof RUNNING;

export type Position = {
  x: number;
  y: number;
};

export type Player = {
  id: ClientId;
  position: Position;
};

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

export type MovementDirection = 'up' | 'down' | 'left' | 'right';

export type MovementResult = {
  player: Player;
  moved: boolean;
};
