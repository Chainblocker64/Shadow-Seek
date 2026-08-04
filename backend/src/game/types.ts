import {
  WAITING,
  RUNNING,
  ENDED,
  PLAYER_STATUS_ALIVE,
  PLAYER_STATUS_DEFEATED,
} from './consts';
import type { ClientId, RoomId } from '../shared/types';
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
  winner: ClientId | null;
  winnerName: string | null;
};

export type PublicPlayerState = {
  id: ClientId;
  name: string;
  health: number;
  maxHealth: number;
  status: PlayerStatus;
};

export type PublicGameInformation = {
  players: PublicPlayerState[];
};

export type GameStatePayload = GameState & {
  publicGameInformation: PublicGameInformation;
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

export type PlayerStatus =
  typeof PLAYER_STATUS_ALIVE | typeof PLAYER_STATUS_DEFEATED;
