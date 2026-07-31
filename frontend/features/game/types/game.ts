import type { GameMap } from "./map";
import type { Player } from "./player";

export type GameState = {
  roomId: string;
  status: "waiting" | "running" | "ended";
  map: GameMap;
  players: Player[];
  endsAt: number | null;
  winner: string | null;
};
