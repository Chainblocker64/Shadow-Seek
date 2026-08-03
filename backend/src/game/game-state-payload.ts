import type { GameState, GameStatePayload } from './types';

export function toGameStatePayload(game: GameState): GameStatePayload {
  return {
    ...game,
    publicGameInformation: {
      players: game.players.map((player) => player.toPublicState()),
    },
  };
}
