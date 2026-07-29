import { Injectable } from '@nestjs/common';
import { Player } from './player/player';
import { DEFAULT_COMBAT_STATS, RUNNING, WAITING } from './consts';
import type {
  GameMap,
  GameState,
  MovementDirection,
  MovementResult,
  Position,
} from './types';
import type { ClientId, RoomId } from '../shared/types';
import { handlePlayerMovement } from './movement/server-movement';

@Injectable()
export class GameService {
  private readonly games = new Map<RoomId, GameState>();

  createGame(roomId: RoomId, playerIds: ClientId[], map: GameMap): GameState {
    const spawnPositions = this.getSpawnPositions(map);

    if (spawnPositions.length < playerIds.length) {
      throw new Error(
        'Map does not have enough spawn positions for all players',
      );
    }

    const game: GameState = {
      roomId,
      status: WAITING,
      map,
      players: playerIds.map(
        (clientId, index) =>
          new Player({
            clientId: clientId,
            position: spawnPositions[index],
            combatStats: DEFAULT_COMBAT_STATS,
          }),
      ),
    };

    this.games.set(roomId, game);

    return game;
  }

  getGame(roomId: RoomId): GameState | undefined {
    return this.games.get(roomId);
  }

  movePlayer(
    roomId: RoomId,
    playerId: ClientId,
    direction: MovementDirection,
  ): MovementResult | undefined {
    const game = this.games.get(roomId);

    if (!game || game.status !== RUNNING) {
      return;
    }

    return handlePlayerMovement(game, playerId, direction);
  }

  startGame(roomId: RoomId): GameState | undefined {
    const game = this.games.get(roomId);

    if (!game || game.status === RUNNING) {
      return game;
    }

    const runningGame: GameState = { ...game, status: RUNNING };
    this.games.set(roomId, runningGame);

    return runningGame;
  }

  private getSpawnPositions(map: GameMap): Position[] {
    return map.objects
      .filter((object) => object.type === 'spawn')
      .map(({ x, y }) => ({ x, y }));
  }
}
