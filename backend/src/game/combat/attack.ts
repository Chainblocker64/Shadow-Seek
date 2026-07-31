import type { ClientId } from '../../shared/types';
import { calculateNextPosition } from '../movement/server-movement';
import type { GameState } from '../types';

export function attack(gameState: GameState, playerId: ClientId): boolean {
  const player = gameState.players.find(
    (player) => player.clientId === playerId,
  );

  if (!player || player.isHandlingAction() || !player.canAttack()) {
    return false;
  }

  player.setActiveAction('attack');

  const playerPosition = player.getPosition();
  const { attackRange, attackValue } = player.getCombatStats();

  const targetPosition = calculateNextPosition(
    playerPosition,
    player.getFacingDirection(),
    attackRange,
  );

  const targetPlayer = gameState.players.find(
    (player) =>
      player.getPosition().x === targetPosition.x &&
      player.getPosition().y === targetPosition.y,
  );

  if (targetPlayer) {
    targetPlayer.takeDamage(attackValue);
  }

  player.setActionTimestamps({
    ...player.getActionTimestamps(),
    attack: Date.now(),
  });

  player.setActiveAction(null);

  return true;
}
