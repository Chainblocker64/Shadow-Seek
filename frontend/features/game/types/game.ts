import type { GameMap } from "./map";
import type { PlayerPosition } from "./player";

export type GameState = {
  roomId: string;
  status: "waiting" | "running" | "ended";
  map: GameMap;
  players: Array<{
    id: string;
    position: PlayerPosition;
  }>;
  endsAt: number | null;
};
