import { GameState } from '../types';
import { hasLineOfSight } from './line-of-sight';
import { isWithinVisionRange } from './distance';
import { Player } from '../player/player';

export function filterGameStateForPlayer(
  gameState: GameState,
  viewer: Player,
): GameState {
  const viewerPosition = viewer.getPosition();
  const mapObjects = gameState.map.objects;

  const visiblePlayers: Player[] = gameState.players.filter((otherPlayer) => {
    if (otherPlayer.clientId === viewer.clientId) {
      return true;
    }

    const targetPosition = otherPlayer.getPosition();

    const inVisionRange = isWithinVisionRange(
      viewerPosition,
      targetPosition,
      viewer.getVisionRange(),
    );
    const hasSight = hasLineOfSight(viewerPosition, targetPosition, mapObjects);

    return inVisionRange && hasSight;
  });

  return {
    ...gameState,
    players: visiblePlayers,
  };
}
