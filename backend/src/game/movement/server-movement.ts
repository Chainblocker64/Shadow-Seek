import {
  canMoveToPosition,
  MovementPosition,
  MovementValidationMap,
} from './movement-validation';

export type ServerMovementDirection = 'up' | 'down' | 'left' | 'right';

export type ServerPlayerState = {
  id: string;
  position: MovementPosition;
};

export type ServerGameState = {
  map: MovementValidationMap;
  players: ServerPlayerState[];
};

export type ServerMovementResult = {
  playerId: string;
  position: MovementPosition;
  moved: boolean;
};

export function calculateNextPosition(
  currentPosition: MovementPosition,
  direction: ServerMovementDirection,
): MovementPosition {
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
  gameState: ServerGameState,
  playerId: string,
  direction: ServerMovementDirection,
): ServerMovementResult {
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
