import type { GameMap } from "./map";
import type { PlayerPosition, PlayerDirection } from "./player";

export type GameState = {
  roomId: string;
  status: "waiting" | "running";
  map: GameMap;
  players: Array<{
    id: string;
    position: PlayerPosition;
    facingDirection: PlayerDirection;
  }>;
};
