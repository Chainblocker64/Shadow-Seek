import type { PlayerDirection, PlayerPosition } from "../../types/player";
import {
  HEALTH_HIGH_COLOR,
  HEALTH_LOW_COLOR,
  HEALTH_LOW_RATIO,
  HEALTH_MEDIUM_COLOR,
  HEALTH_MEDIUM_RATIO,
} from "../shared/constants";

export function getFacingTile(
  position: PlayerPosition,
  direction: PlayerDirection,
): PlayerPosition {
  switch (direction) {
    case "up":
      return {
        x: position.x,
        y: position.y - 1,
      };

    case "down":
      return {
        x: position.x,
        y: position.y + 1,
      };

    case "left":
      return {
        x: position.x - 1,
        y: position.y,
      };

    case "right":
      return {
        x: position.x + 1,
        y: position.y,
      };
  }
}

export function getTileDistance(a: PlayerPosition, b: PlayerPosition): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function getHealthBarColor(healthRatio: number): number {
  if (healthRatio > HEALTH_MEDIUM_RATIO) {
    return HEALTH_HIGH_COLOR;
  }

  if (healthRatio > HEALTH_LOW_RATIO) {
    return HEALTH_MEDIUM_COLOR;
  }

  return HEALTH_LOW_COLOR;
}
