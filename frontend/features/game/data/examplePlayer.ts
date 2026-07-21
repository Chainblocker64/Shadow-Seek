import { PlayerGameState, PlayerPosition } from "../types/player";

export const examplePlayerPosition: PlayerPosition = {
  x: 2,
  y: 2,
};

export const examplePlayerGameState: PlayerGameState = {
  id: "player-1",
  name: "Player 1",
  position: examplePlayerPosition,
  direction: "down",
  health: 100,
};

export const examplePlayers: PlayerGameState[] = [
  examplePlayerGameState,
  {
    id: "player-2",
    name: "Player 2",
    position: {
      x: 22,
      y: 22,
    },
    direction: "up",
    health: 100,
  },
];
