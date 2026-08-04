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
    // A concealing object hides the player standing on it: the board still
    // draws them, just faint and behind the object, so an enemy has to look
    // instead of merely glance.
    concealsPlayers: boolean;
  }
> = {
  wall: {
    walkable: false,
    blocksVision: true,
    concealsPlayers: false,
  },
  tree: {
    walkable: false,
    blocksVision: true,
    concealsPlayers: false,
  },
  rock: {
    walkable: false,
    blocksVision: true,
    concealsPlayers: false,
  },

  spawn: {
    walkable: true,
    blocksVision: false,
    concealsPlayers: false,
  },
  bush: {
    walkable: true,
    blocksVision: true,
    concealsPlayers: true,
  },
  chest: {
    walkable: false,
    blocksVision: false,
    concealsPlayers: false,
  },
  water: {
    walkable: true,
    blocksVision: false,
    concealsPlayers: true,
  },
};

/**
 * Returns the object a player at `position` can hide in, or `null` when the
 * tile offers no cover.
 */
export function findConcealingObjectAt(
  map: GameMap,
  position: { x: number; y: number },
): MapObject | null {
  return (
    map.objects.find(
      (object) =>
        object.x === position.x &&
        object.y === position.y &&
        MAP_OBJECT_PROPERTIES[object.type].concealsPlayers,
    ) ?? null
  );
}
