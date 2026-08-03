export type PlayerPosition = {
  x: number;
  y: number;
};

export type PlayerDirection = "up" | "down" | "left" | "right";

export type PlayerStatus = "alive" | "defeated";

export type PublicPlayer = {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  status: PlayerStatus;
};

export type Player = PublicPlayer & {
  spriteIndex: number;
  position: PlayerPosition;
  facingDirection: PlayerDirection;
  visionRange: number;
};
