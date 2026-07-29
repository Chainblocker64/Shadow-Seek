import type { GameMap } from "./map";
import type { PlayerPosition } from "./player";

export type GameState = {
  roomId: string;
  status: "waiting" | "running" | "ended";
  map: GameMap;
  players: Array<{
    clientId: string;
    name: string;
    position: PlayerPosition;
  }>;
  endsAt: number | null;
};
