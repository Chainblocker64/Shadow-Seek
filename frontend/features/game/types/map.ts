export const DEFAULT_MAP_WIDTH = 50;
export const DEFAULT_MAP_HEIGHT = 50;

export const BASE_TILE_TYPES = [
  "floor",
  "grass",
  "dirt",
  "stoneFloor",
] as const;
export type BaseTileType = (typeof BASE_TILE_TYPES)[number];

export const MAP_OBJECT_TYPES = [
  "wall",
  "tree",
  "rock",
  "spawn",
  "bush",
  "chest",
  "water",
] as const;
export type MapObjectType = (typeof MAP_OBJECT_TYPES)[number];

export type BaseTileOverride = {
  x: number;
  y: number;
  type: BaseTileType;
};

export type MapObject = {
  x: number;
  y: number;
  type: MapObjectType;
};

export type GameMap = {
  name: string;
  width: number;
  height: number;
  baseTile: BaseTileType;
  baseOverrides: BaseTileOverride[];
  objects: MapObject[];
};

export const BASE_TILE_PROPERTIES: Record<
  BaseTileType,
  {
    walkable: boolean;
    blocksVision: boolean;
  }
> = {
  floor: {
    walkable: true,
    blocksVision: false,
  },
  grass: {
    walkable: true,
    blocksVision: false,
  },
  dirt: {
    walkable: true,
    blocksVision: false,
  },
  stoneFloor: {
    walkable: true,
    blocksVision: false,
  },
};

export const MAP_OBJECT_PROPERTIES: Record<
  MapObjectType,
  {
    walkable: boolean;
    blocksVision: boolean;
  }
> = {
  wall: {
    walkable: false,
    blocksVision: true,
  },
  tree: {
    walkable: false,
    blocksVision: true,
  },
  rock: {
    walkable: false,
    blocksVision: true,
  },

  spawn: {
    walkable: true,
    blocksVision: false,
  },
  bush: {
    walkable: true,
    blocksVision: true,
  },
  chest: {
    walkable: false,
    blocksVision: false,
  },
  water: {
    walkable: false,
    blocksVision: false,
  },
};
