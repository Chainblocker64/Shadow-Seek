export type PlayerPosition = {
  x: number;
  y: number;
};

export type PlayerDirection = "up" | "down" | "left" | "reight";

export type PlayerGameState = {
  id: string;
  name: string;
  position: PlayerPosition;
  direction: PlayerDirection;
  health: number;
};
