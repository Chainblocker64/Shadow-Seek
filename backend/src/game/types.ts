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

export type ValidationMap = {
  width: number;
  height: number;
  baseTile: BaseTileType;
  objects: MapObject[];
};

export type GameState = {
  roomId: RoomId;
  status: Status;
  map: ValidationMap;
  players: Player[];
};

export type BaseTileType = 'floor' | 'grass' | 'dirt' | 'stoneFloor';

export type ObjectType =
  'wall' | 'tree' | 'rock' | 'spawn' | 'bush' | 'chest' | 'water';

export type MapObject = Position & {
  type: ObjectType;
};

export type MovementDirection = 'up' | 'down' | 'left' | 'right';

export type MovementResult = {
  player: Player;
  moved: boolean;
};
