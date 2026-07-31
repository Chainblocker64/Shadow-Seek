export type PlayerPosition = {
  x: number;
  y: number;
};

export type PlayerDirection = "up" | "down" | "left" | "right";

export type Player = {
  id: string;
  name: string;
  spriteIndex: number;
  position: PlayerPosition;
  health: number;
  facingDirection: PlayerDirection;
};
