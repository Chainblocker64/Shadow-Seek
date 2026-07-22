import { WAITING, RUNNING } from './consts';

// TODO use across the app (global types)
export type ClientId = string;

export type Status = typeof WAITING | typeof RUNNING;

export type Position = {
  x: number;
  y: number;
};

export type Player = {
  id: string;
  position: Position;
};

export type ValidationMap = {
  width: number;
  height: number;
  baseTile: BaseTileType;
  objects: MapObject[];
};

export type GameState = {
  id: string;
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
