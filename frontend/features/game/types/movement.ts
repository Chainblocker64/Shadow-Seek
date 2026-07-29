import type { Player } from "./player";

export const MOVEMENT_DIRECTIONS = ["up", "down", "left", "right"] as const;

export type MovementDirection = (typeof MOVEMENT_DIRECTIONS)[number];

export type MovementResult = {
  player: Player;
  moved: boolean;
};

export function isMovementDirection(
  value: unknown,
): value is MovementDirection {
  return (
    typeof value === "string" &&
    MOVEMENT_DIRECTIONS.includes(value as MovementDirection)
  );
}
