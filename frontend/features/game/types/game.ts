import type { GameMap } from "./map";
import type { Player, PublicPlayer } from "./player";

export type PublicGameInformation = {
  players: PublicPlayer[];
};

export type GameState = {
  roomId: string;
  status: "waiting" | "running" | "ended";
  map: GameMap;
  players: Player[];
  publicGameInformation: PublicGameInformation;
  endsAt: number | null;
  winner: string | null;
};
