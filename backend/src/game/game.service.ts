import { Injectable } from '@nestjs/common';
import { ENDED, GAME_DURATION_MS, RUNNING, WAITING } from './consts';
import type { GameState, Position, GameMap } from './types';
import type { ClientId, RoomId } from '../shared/types';

@Injectable()
export class GameService {
  private readonly games = new Map<RoomId, GameState>();

  createGame(
    roomId: RoomId,
    players: Array<{ id: ClientId; name: string }>,
    map: GameMap,
  ): GameState {
    const spawnPositions = this.getSpawnPositions(map);

    if (spawnPositions.length < players.length) {
      throw new Error(
        'Map does not have enough spawn positions for all players',
      );
    }

    const game: GameState = {
      roomId,
      status: WAITING,
      map,
      players: players.map(({ id, name }, index) => ({
        id,
        name,
        position: spawnPositions[index],
      })),
      endsAt: null,
    };

    this.games.set(roomId, game);

    return game;
  }

  getGame(roomId: RoomId): GameState | undefined {
    return this.games.get(roomId);
  }

  getPlayerGame(clientId: ClientId): GameState | undefined {
    for (const game of this.games.values()) {
      if (game.players.some((player) => player.id === clientId)) {
        return game;
      }
    }
  }

  addPlayer(
    roomId: RoomId,
    player: { id: ClientId; name: string },
  ): GameState | undefined {
    const game = this.games.get(roomId);

    if (!game || game.status === ENDED) {
      return;
    }

    if (game.players.some(({ id }) => id === player.id)) {
      return game;
    }

    const position = this.getFreeSpawnPosition(game);

    if (!position) {
      return;
    }

    const updatedGame: GameState = {
      ...game,
      players: [...game.players, { ...player, position }],
    };

    this.games.set(roomId, updatedGame);

    return updatedGame;
  }

  removePlayer(clientId: ClientId): GameState | undefined {
    const game = this.getPlayerGame(clientId);

    if (!game) {
      return;
    }

    const remainingPlayers = game.players.filter(
      (player) => player.id !== clientId,
    );
    const updatedGame: GameState = { ...game, players: remainingPlayers };

    if (remainingPlayers.length === 0) {
      this.games.delete(game.roomId);
    } else {
      this.games.set(game.roomId, updatedGame);
    }

    return updatedGame;
  }

  startGame(roomId: RoomId): GameState | undefined {
    const game = this.games.get(roomId);

    if (!game || game.status === RUNNING) {
      return game;
    }

    const runningGame: GameState = {
      ...game,
      status: RUNNING,
      endsAt: Date.now() + GAME_DURATION_MS,
    };
    this.games.set(roomId, runningGame);

    return runningGame;
  }

  endGame(roomId: RoomId): GameState | undefined {
    const game = this.games.get(roomId);

    if (!game || game.status !== RUNNING) {
      return game;
    }

    const endedGame: GameState = { ...game, status: ENDED, endsAt: null };
    this.games.set(roomId, endedGame);

    return endedGame;
  }

  private getFreeSpawnPosition(game: GameState): Position | undefined {
    return this.getSpawnPositions(game.map).find(
      (spawn) =>
        !game.players.some(
          ({ position }) => position.x === spawn.x && position.y === spawn.y,
        ),
    );
  }

  private getSpawnPositions(map: GameMap): Position[] {
    return map.objects
      .filter((object) => object.type === 'spawn')
      .map(({ x, y }) => ({ x, y }));
  }
}
