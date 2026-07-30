import { GameState, MovementDirection, Position } from '../types';
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
) {
  const player = gameState.players.find((currentPlayer) => {
    return currentPlayer.clientId === playerId;
  });

  if (!player) {
    return;
  }

  player.setFacingDirection(direction);

  const nextPosition = calculateNextPosition(player.getPosition(), direction);

  if (canMoveToPosition(gameState, nextPosition)) {
    player.setPosition(nextPosition);
  }

  return gameState;
}
