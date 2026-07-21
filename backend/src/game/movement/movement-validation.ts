export type MovementBaseTileType = 'floor' | 'grass' | 'dirt' | 'stoneFloor';

export type MovementObjectType =
  'wall' | 'tree' | 'rock' | 'spawn' | 'bush' | 'chest' | 'water';

export type MovementPosition = {
  x: number;
  y: number;
};

export type MovementMapObject = {
  x: number;
  y: number;
  type: MovementObjectType;
};

export type MovementValidationMap = {
  width: number;
  height: number;
  baseTile: MovementBaseTileType;
  objects: MovementMapObject[];
};

const WALKABLE_OBJECT_TYPES: MovementObjectType[] = ['spawn', 'bush'];

const BLOCKING_OBJECT_TYPES: MovementObjectType[] = [
  'wall',
  'tree',
  'rock',
  'chest',
  'water',
];

export function canMoveToPosition(
  map: MovementValidationMap,
  targetPosition: MovementPosition,
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
