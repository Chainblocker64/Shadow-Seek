export const DEFAULT_MAP_WIDTH = 20;
export const DEFAULT_MAP_HEIGHT = 20;

export const TILE_TYPES = ["floor", "wall", "tree", "rock", "spawn"] as const;
export type TileType = (typeof TILE_TYPES)[number];

export type Tile = {
  x: number;
  y: number;
  type: TileType;
};

export type GameMap = {
  name: string;
  width: number;
  height: number;
  tiles: TileType[][];
};

export const WALKABLE_TILE_TYPES: TileType[] = ["floor", "spawn"];
export const BLOCKING_TILE_TYPES: TileType[] = ["wall", "tree", "rock"];
