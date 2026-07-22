export const GAME_STATUS_WAITING = 'waiting';
export const GAME_STATUS_RUNNING = 'running';

export type GameStatus =
  typeof GAME_STATUS_WAITING | typeof GAME_STATUS_RUNNING;

export type Position = {
  x: number;
  y: number;
};

export type PlayerGameState = {
  id: string;
  position: Position;
};

export type GameState = {
  id: string;
  status: GameStatus;
  map: ValidationMap;
  players: PlayerGameState[];
};

export type BaseTileType = 'floor' | 'grass' | 'dirt' | 'stoneFloor';

export type ObjectType =
  'wall' | 'tree' | 'rock' | 'spawn' | 'bush' | 'chest' | 'water';

export type MapObject = Position & {
  type: ObjectType;
};

export type ValidationMap = {
  width: number;
  height: number;
  baseTile: BaseTileType;
  objects: MapObject[];
};

export type MovementDirection = 'up' | 'down' | 'left' | 'right';

export type ServerPlayerState = {
  id: string;
  position: Position;
};

export type MovementResult = {
  playerId: string;
  position: Position;
  moved: boolean;
};
