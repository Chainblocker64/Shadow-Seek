import { Position, MapObject } from '../types';
import { VIEW_BLOCKING_OBJECT_TYPES } from '../consts';

/**
 * checks if there is a clear line of sight between a source and target position
 * by stepping through intermediate grid coordinates and returning false if a blocker
 * is found along the path.
 */
export function hasLineOfSight(
  source: Position,
  target: Position,
  objects: MapObject[],
): boolean {
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  // calculate number of steps based on the largest distance
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  // source === target?
  if (steps === 0) return true;

  for (let i = 1; i <= steps; i++) {
    // calculate current position as a percentage of steps
    const t = i / steps;
    const currentX = Math.round(source.x + dx * t);
    const currentY = Math.round(source.y + dy * t);

    // target reached?
    if (currentX === target.x && currentY === target.y) {
      return true;
    }

    // get object on current x/y coordinate
    const foundObject = objects.find(
      (obj) => obj.x === currentX && obj.y === currentY,
    );

    // blocker found?
    if (foundObject && VIEW_BLOCKING_OBJECT_TYPES.includes(foundObject.type)) {
      return false;
    }
  }

  return true;
}
