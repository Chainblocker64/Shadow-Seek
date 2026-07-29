export type PlayerPosition = {
  x: number;
  y: number;
};

export type PlayerDirection = "up" | "down" | "left" | "right";

export type Player = {
  id: string;
  name: string;
  position: PlayerPosition;
  facingDirection: PlayerDirection;
};

export type PlayerGameState = {
  id: string;
  name: string;
  position: PlayerPosition;
  direction: PlayerDirection;
  health: number;
};
