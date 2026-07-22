import { ValidationMap, Position } from '../types';
import { WALKABLE_OBJECT_TYPES, BLOCKING_OBJECT_TYPES } from '../consts';

export function canMoveToPosition(
  map: ValidationMap,
  targetPosition: Position,
): boolean {
  const isOutsideMap =
    targetPosition.x < 0 ||
    targetPosition.y < 0 ||
    targetPosition.x >= map.width ||
    targetPosition.y >= map.height;

  if (isOutsideMap) {
    return false;
  }

  const objectAtTargetPosition = map.objects.find((object) => {
    return object.x === targetPosition.x && object.y === targetPosition.y;
  });

  if (!objectAtTargetPosition) {
    return true;
  }

  if (WALKABLE_OBJECT_TYPES.includes(objectAtTargetPosition.type)) {
    return true;
  }

  return !BLOCKING_OBJECT_TYPES.includes(objectAtTargetPosition.type);
}
