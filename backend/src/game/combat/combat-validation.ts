import { Player } from '../player/player';

export function canAttack(player: Player): boolean {
  const { attack: lastAttackTimestamp } = player.getActionTimestamps();
  const { attackCooldown } = player.getCombatStats();

  const cooldownPassed = lastAttackTimestamp + attackCooldown < Date.now();

  if (!cooldownPassed || !player.canAct()) {
    return false;
  }

  return true;
}
