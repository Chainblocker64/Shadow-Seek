import { GameMap, GameState, Position } from '../types';
import {
  WALKABLE_OBJECT_TYPES,
  BLOCKING_OBJECT_TYPES,
  PLAYER_STATUS_DEFEATED,
} from '../consts';

export function canMoveToPosition(
  gameState: GameState,
  targetPosition: Position,
): boolean {
  return (
    tileIsWalkable(gameState.map, targetPosition) &&
    !isOccupied(gameState, targetPosition)
  );
}

function tileIsWalkable(map: GameMap, targetPosition: Position): boolean {
  return (
    !isOutsideMap(map, targetPosition) &&
    !objectBlocksPosition(map, targetPosition)
  );
}

function isOccupied(gameState: GameState, targetPosition: Position): boolean {
  return gameState.players.some(
    (currentPlayer) =>
      currentPlayer.getStatus() !== PLAYER_STATUS_DEFEATED &&
      currentPlayer.getPosition().x === targetPosition.x &&
      currentPlayer.getPosition().y === targetPosition.y,
  );
}

function isOutsideMap(map: GameMap, targetPosition: Position): boolean {
  return (
    targetPosition.x < 0 ||
    targetPosition.y < 0 ||
    targetPosition.x >= map.width ||
    targetPosition.y >= map.height
  );
}

function objectBlocksPosition(map: GameMap, targetPosition: Position): boolean {
  const objectAtTargetPosition = map.objects.find((object) => {
    return object.x === targetPosition.x && object.y === targetPosition.y;
  });

  if (!objectAtTargetPosition) {
    return false;
  }

  if (WALKABLE_OBJECT_TYPES.includes(objectAtTargetPosition.type)) {
    return false;
  }

  if (BLOCKING_OBJECT_TYPES.includes(objectAtTargetPosition.type)) {
    return true;
  }

  return true;
}
