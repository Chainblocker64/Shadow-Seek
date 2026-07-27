import type { BaseTileType, MapObjectType } from "../types/map";

export const TILE_TEXTURE_SIZE = 32;

export const baseTileTextureFrames: Record<
  BaseTileType,
  { x: number; y: number }
> = {
  floor: {
    x: 224,
    y: 480,
  },
  grass: {
    x: 1760,
    y: 448,
  },
  dirt: {
    x: 928,
    y: 416,
  },
  stoneFloor: {
    x: 576,
    y: 448,
  },
};

export const playerTextureFrames: { x: number; y: number }[] = [
  { x: 0, y: 64 }, // red armored warrior
  { x: 768, y: 32 }, // green-robed mage
  { x: 832, y: 32 }, // purple-robed wizard
  { x: 896, y: 32 }, // blue-robed mage
];

export const playerFallbackLabels: string[] = [
  "Warrior",
  "Emerald Mage",
  "Violet Wizard",
  "Azure Mage",
];

export const mapObjectTextureFrames: Record<
  MapObjectType,
  { x: number; y: number }
> = {
  wall: {
    x: 768,
    y: 416,
  },
  tree: {
    x: 448,
    y: 576,
  },
  rock: {
    x: 1312,
    y: 384,
  },
  spawn: {
    x: 960,
    y: 480,
  },
  bush: {
    x: 320,
    y: 192,
  },
  chest: {
    x: 192,
    y: 32,
  },
  water: {
    x: 896,
    y: 608,
  },
};
