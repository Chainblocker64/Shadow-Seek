import type { TileType } from "../types/map";

export const TILE_TEXTURE_SIZE = 32;

export const tileTextureFrames: Record<TileType, { x: number; y: number }> = {
  floor: {
    x: 128,
    y: 480,
  },
  wall: {
    x: 544,
    y: 448,
  },
  tree: {
    x: 384,
    y: 576,
  },
  rock: {
    x: 288,
    y: 488,
  },
  spawn: {
    x: 256,
    y: 608,
  },
};
