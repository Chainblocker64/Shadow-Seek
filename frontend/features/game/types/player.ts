export type PlayerPosition = {
  x: number;
  y: number;
};

export type PlayerDirection = "up" | "down" | "left" | "right";

export type PublicPlayer = {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
};

export type Player = PublicPlayer & {
  spriteIndex: number;
  position: PlayerPosition;
  facingDirection: PlayerDirection;
  visionRange: number;
};
