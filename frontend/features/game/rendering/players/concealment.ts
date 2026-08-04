import {
  findConcealingObjectAt,
  type GameMap,
  type MapObject,
} from "../../types/map";
import { CONCEALMENT_REVEAL_DISTANCE } from "../shared/constants";
import type { GamePlayer } from "../shared/types";
import { getTileDistance } from "./playerUtils";

type ConcealmentOptions = {
  map: GameMap;
  player: GamePlayer;
  players: GamePlayer[];
  localPlayerId: string | undefined;
};

/**
 * The cover a player is hidden by from the local player's point of view, or
 * `null` when there is none. Your own cover never hides you from yourself, and
 * someone standing right next to you is plain to see — with no local player on
 * the board (a defeated spectator) there is nobody the cover could give way
 * to, so it always holds.
 */
export function findCoverFor({
  map,
  player,
  players,
  localPlayerId,
}: ConcealmentOptions): MapObject | null {
  const concealingObject = findConcealingObjectAt(map, player.position);

  if (!concealingObject || player.id === localPlayerId) {
    return concealingObject;
  }

  const localPlayer = players.find(
    (currentPlayer) => currentPlayer.id === localPlayerId,
  );

  const distance = localPlayer
    ? getTileDistance(localPlayer.position, player.position)
    : Number.POSITIVE_INFINITY;

  return distance <= CONCEALMENT_REVEAL_DISTANCE ? null : concealingObject;
}

/**
 * Enemies in cover lose the markers that make a player obvious — name, health
 * and facing. Your own player keeps them, so you never lose track of your own
 * state while hiding.
 */
export function isPlayerConcealed(options: ConcealmentOptions): boolean {
  return (
    options.player.id !== options.localPlayerId &&
    findCoverFor(options) !== null
  );
}
