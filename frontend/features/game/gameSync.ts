import { socket } from "@/lib/socket";
import type { GameState } from "./types/game";

let latestGame: GameState | null = null;

socket.on("game:sync", (game: GameState) => {
  latestGame = game;
});
socket.on("game:started", (game: GameState) => {
  latestGame = game;
});

export function getLatestGame(): GameState | null {
  return latestGame;
}
