import type { GameMap } from "../../types/map";
import type { GameState } from "../../types/game";
import type { Player, PlayerPosition } from "../../types/player";

export type GamePlayer = Player & {
  label: string;
};

export type AttackEvent = {
  attackerId: string;
  targetId: string | null;
  targetPosition: PlayerPosition;
};

export type PixiGameBoardProps = {
  map: GameMap;
  players: GamePlayer[];
  status: GameState["status"];
  currentPlayerSpawnPosition: PlayerPosition | null;
  winnerPosition: PlayerPosition | null;
  isSpectating?: boolean;
};
