import { GameState, MovementDirection, Position } from '../types';
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
) {
  const player = gameState.players.find((currentPlayer) => {
    return currentPlayer.clientId === playerId;
  });

  if (!player || player.isHandlingAction() || !player.canAct()) {
    return false;
  }
  player.setActiveAction('movement');

  player.setFacingDirection(direction);

  const nextPosition = calculateNextPosition(player.getPosition(), direction);

  if (canMoveToPosition(gameState, nextPosition)) {
    player.setPosition(nextPosition);
  }

  player.setActiveAction(null);
  return true;
}
