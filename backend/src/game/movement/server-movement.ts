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
  player.facingDirection = direction;
  const nextPosition = calculateNextPosition(player.position, direction);

  const targetPositionIsOccupied = gameState.players.some(
    (currentPlayer) =>
      currentPlayer.id !== playerId &&
      currentPlayer.position.x === nextPosition.x &&
      currentPlayer.position.y === nextPosition.y,
  );

  const canMove =
    !targetPositionIsOccupied && canMoveToPosition(gameState.map, nextPosition);

  if (!canMove) {
    return {
      player: player,
      moved: false,
    };
  }

  player.position = nextPosition;

  return {
    player: player,
    moved: true,
  };
}
