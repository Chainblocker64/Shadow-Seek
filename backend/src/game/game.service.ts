import { Injectable } from '@nestjs/common';
import { Player } from './player/player';
import {
  ENDED,
  GAME_DURATION_MS,
  DEFAULT_VISION_RANGE,
  RUNNING,
  WAITING,
} from './consts';
import type {
  GameMap,
  GameState,
  MovementDirection,
  MovementResult,
  Position,
} from './types';
import type { ClientId, RoomId } from '../shared/types';
import { handlePlayerMovement } from './movement/server-movement';
import { attack } from './combat/attack';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class GameService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

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
      players: players.map(
        ({ id: clientId, name }, index) =>
          new Player({
            clientId,
            name,
            position: spawnPositions[index],
            spriteIndex: index,
            visionRange: DEFAULT_VISION_RANGE,
            facingDirection: 'down',
          }),
      ),
      endsAt: null,
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
  ): GameState | undefined {
    const game = this.games.get(roomId);

    if (!game || game.status !== RUNNING) {
      return;
    }

    const player = game.players.find((currentPlayer) => {
      return currentPlayer.clientId === playerId;
    });

    if (!player) {
      return;
    }

    if (player.isHandlingAction()) {
      return;
    }

    player.setActiveAction('movement');

    handlePlayerMovement(game, playerId, direction);
    player.setActiveAction(null);
  }

  getPlayerGame(clientId: ClientId): GameState | undefined {
    for (const game of this.games.values()) {
      if (game.players.some((player) => player.clientId === clientId)) {
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

    if (game.players.some(({ clientId }) => clientId === player.id)) {
      return game;
    }

    const position = this.getFreeSpawnPosition(game);

    if (!position) {
      return;
    }

    const updatedGame: GameState = {
      ...game,
      players: [
        ...game.players,
        new Player({
          clientId: player.id,
          name: player.name,
          position,
          spriteIndex: this.getFreeSpriteIndex(game),
        }),
      ],
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
      (player) => player.clientId !== clientId,
    );
    const updatedGame: GameState = { ...game, players: remainingPlayers };

    if (remainingPlayers.length === 0) {
      this.games.delete(game.roomId);
    } else {
      this.games.set(game.roomId, updatedGame);
    }

    return updatedGame;
  }

  playerAttack(roomId: RoomId, playerId: ClientId) {
    const game = this.games.get(roomId);
    if (!game || game.status !== RUNNING) {
      return;
    }

    const couldAttack = attack(game, playerId);
    if (couldAttack) {
      this.triggerGamestateBroadcast(roomId, game);
    }
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
        !game.players.some((player) => {
          const position = player.getPosition();

          return position.x === spawn.x && position.y === spawn.y;
        }),
    );
  }

  private getFreeSpriteIndex(game: GameState): number {
    const usedSpriteIndexes = new Set(
      game.players.map((player) => player.spriteIndex),
    );

    let spriteIndex = 0;

    while (usedSpriteIndexes.has(spriteIndex)) {
      spriteIndex += 1;
    }

    return spriteIndex;
  }

  private getSpawnPositions(map: GameMap): Position[] {
    return map.objects
      .filter((object) => object.type === 'spawn')
      .map(({ x, y }) => ({ x, y }));
  }

  private triggerGamestateBroadcast(roomId: RoomId, gameState: GameState) {
    this.eventEmitter.emit('game.broadcast', gameState);
  }
}
