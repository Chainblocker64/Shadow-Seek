import {
  GameState,
  MovementDirection,
  MovementResult,
  Position,
} from '../types';
import { canMoveToPosition } from './movement-validation';

export function calculateNextPosition(
  currentPosition: Position,
  direction: MovementDirection,
): Position {
  switch (direction) {
    case 'up':
      return {
        x: currentPosition.x,
        y: currentPosition.y - 1,
      };
    case 'down':
      return {
        x: currentPosition.x,
        y: currentPosition.y + 1,
      };
    case 'left':
      return {
        x: currentPosition.x - 1,
        y: currentPosition.y,
      };
    case 'right':
      return {
        x: currentPosition.x + 1,
        y: currentPosition.y,
      };
  }
}

export function handlePlayerMovement(
  gameState: GameState,
  playerId: string,
  direction: MovementDirection,
): MovementResult {
  const player = gameState.players.find((currentPlayer) => {
    return currentPlayer.id === playerId;
  });

  if (!player) {
    throw new Error('Player not found');
  }

  const nextPosition = calculateNextPosition(player.position, direction);

  const canMove = canMoveToPosition(gameState.map, nextPosition);

  if (!canMove) {
    return {
      playerId: player.id,
      position: player.position,
      moved: false,
    };
  }

  player.position = nextPosition;

  return {
    playerId: player.id,
    position: player.position,
    moved: true,
  };
}
