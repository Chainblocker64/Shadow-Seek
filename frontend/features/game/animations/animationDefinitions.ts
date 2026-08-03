export type AnimationFrame = {
  x: number;
  y: number;
};

export type AnimationDefinition = {
  frames: AnimationFrame[];
  speed: number;
  loop: boolean;
};

export const animationDefinitions = {
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

  attack: {
    frames: [
      { x: 96, y: 0 },
      { x: 128, y: 0 },
      { x: 160, y: 0 },
      { x: 192, y: 0 },
      { x: 224, y: 0 },
    ],
    speed: 0.22,
    loop: false,
  },

  portalOpen: {
    frames: [
      { x: 544, y: 320 },
      { x: 576, y: 320 },
      { x: 608, y: 320 },
      { x: 1120, y: 480 },
      { x: 928, y: 480 },
      { x: 960, y: 480 },
    ],
    speed: 0.11,
    loop: false,
  },

  portalClose: {
    frames: [
      { x: 960, y: 480 },
      { x: 928, y: 480 },
      { x: 1120, y: 480 },
      { x: 608, y: 320 },
      { x: 576, y: 320 },
      { x: 544, y: 320 },
    ],
    speed: 0.11,
    loop: false,
  },
} satisfies Record<string, AnimationDefinition>;

export type AnimationName = keyof typeof animationDefinitions;
