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
  distance: number = 1,
): Position {
  switch (direction) {
    case 'up':
      return {
        x: currentPosition.x,
        y: currentPosition.y - distance,
      };
    case 'down':
      return {
        x: currentPosition.x,
        y: currentPosition.y + distance,
      };
    case 'left':
      return {
        x: currentPosition.x - distance,
        y: currentPosition.y,
      };
    case 'right':
      return {
        x: currentPosition.x + distance,
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
    return currentPlayer.clientId === playerId;
  });

  if (!player) {
    throw new Error('Player not found');
  }
  player.setFacingDirection(direction);

  const nextPosition = calculateNextPosition(player.getPosition(), direction);

  const targetPositionIsOccupied = gameState.players.some(
    (currentPlayer) =>
      currentPlayer.clientId !== playerId &&
      currentPlayer.getPosition() === nextPosition,
  );

  const canMove =
    !targetPositionIsOccupied && canMoveToPosition(gameState.map, nextPosition);

  if (!canMove) {
    return {
      player: player,
      moved: false,
    };
  }

  player.setPosition(nextPosition);

  return {
    player: player,
    moved: true,
  };
}
