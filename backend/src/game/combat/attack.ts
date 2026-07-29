import type { ClientId } from '../../shared/types';
import { calculateNextPosition } from '../movement/server-movement';
import type { GameState } from '../types';
import { canAttack } from './combat-validation';

export function attack(gameState: GameState, playerId: ClientId) {
  const player = gameState.players.find(
    (player) => player.clientId === playerId,
  );

  if (!player || !canAttack(player)) {
    return;
  }

  const playerPosition = player.getPosition();
  const { attackRange, attackValue } = player.getCombatStats();

  const targetPosition = calculateNextPosition(
    playerPosition,
    player.getFacingDirection(),
    attackRange,
  );

  const targetPlayer = gameState.players.find(
    (player) => player.getPosition() === targetPosition,
  );

  if (!targetPlayer) {
    return;
  }

  targetPlayer.takeDamage(attackValue);
}
