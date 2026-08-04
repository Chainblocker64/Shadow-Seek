import { socket } from "@/lib/socket";
import type { GameState } from "./types/game";

let latestGame: GameState | null = null;
let latestGameIsSpectator = false;

socket.on("game:sync", (game: GameState) => {
  latestGame = game;
  latestGameIsSpectator = false;
});
socket.on("game:spectator:sync", (game: GameState) => {
  latestGame = game;
  latestGameIsSpectator = true;
});
socket.on("game:started", (game: GameState) => {
  latestGame = game;
});
socket.on("game:ended", (game: GameState) => {
  latestGame = game;
});
socket.on("game:left", () => {
  latestGame = null;
  latestGameIsSpectator = false;
});

export function getLatestGame(): GameState | null {
  return latestGame;
}

export function getLatestGameIsSpectator(): boolean {
  return latestGameIsSpectator;
}
