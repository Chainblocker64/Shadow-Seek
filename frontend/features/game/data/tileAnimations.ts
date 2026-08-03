export type TileAnimation = {
  frames: {
    x: number;
    y: number;
  }[];

  speed: number;
  loop: boolean;
};

export const tileAnimations = {};
