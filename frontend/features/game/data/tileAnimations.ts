export type AnimationFrame = {
  x: number;
  y: number;
};

export type TileAnimation = {
  frames: AnimationFrame[];
  speed: number;
  loop: boolean;
};

export const tileAnimations = {
  water: {
    frames: [
      { x: 864, y: 608 },
      { x: 896, y: 608 },
      { x: 928, y: 608 },
      { x: 960, y: 608 },
      { x: 992, y: 608 },
      { x: 1024, y: 608 },
      { x: 1056, y: 608 },
      { x: 1088, y: 608 },
      { x: 1120, y: 608 },
    ],
    speed: 0.12,
    loop: true,
  },
} satisfies Record<string, TileAnimation>;
