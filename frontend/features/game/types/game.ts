import type { GameMap } from "./map";
import type { Player } from "./player";

export type GameState = {
  roomId: string;
  status: "waiting" | "running";
  map: GameMap;
  players: Player[];
};
