import type { ClientId } from '../../shared/types';
import { calculateNextPosition } from '../movement/server-movement';
import type { GameState, Position } from '../types';

export type AttackResult = {
  attackerId: ClientId;
  targetId: ClientId | null;
  targetPosition: Position;
};

export function attack(
  gameState: GameState,
  playerId: ClientId,
): AttackResult | null {
  const player = gameState.players.find(
    (currentPlayer) => currentPlayer.clientId === playerId,
  );

  if (!player || player.isHandlingAction() || !player.canAttack()) {
    return null;
  }

  player.setActiveAction('attack');

  const playerPosition = player.getPosition();
  const { attackRange, attackValue } = player.getCombatStats();

  const targetPosition = calculateNextPosition(
    playerPosition,
    player.getFacingDirection(),
    attackRange,
  );

  const targetPlayer = gameState.players.find((currentPlayer) => {
    const position = currentPlayer.getPosition();

    return (
      currentPlayer.clientId !== playerId &&
      position.x === targetPosition.x &&
      position.y === targetPosition.y
    );
  });

  if (targetPlayer) {
    targetPlayer.takeDamage(attackValue);
  }

  player.setActionTimestamps({
    ...player.getActionTimestamps(),
    attack: Date.now(),
  });

  player.setActiveAction(null);

  return {
    attackerId: playerId,
    targetId: targetPlayer?.clientId ?? null,
    targetPosition,
  };
}
