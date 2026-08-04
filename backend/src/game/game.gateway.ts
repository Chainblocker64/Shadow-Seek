import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { ClientId, RoomId } from '../shared/types';
import { LobbyService } from '../lobby/lobby.service';
import { MapsService } from '../maps/maps.service';
import {
  GAME_DURATION_MS,
  GAME_START_DELAY_MS,
  MIN_PLAYERS_TO_START,
  RUNNING,
} from './consts';
import { GameService } from './game.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { MovePlayerDto } from './dto/move-player.dto';
import { SpectateGameDto } from './dto/spectate-game.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { RoomUpdatedEvent } from '../lobby/events/room-updated.event';
import type { GameState } from './types';
import { toGameStatePayload } from './game-state-payload';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL } })
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class GameGateway {
  @WebSocketServer()
  server!: Server;

  private readonly gameStartTimers = new Map<
    RoomId,
    ReturnType<typeof setTimeout>
  >();

  private readonly gameEndTimers = new Map<
    RoomId,
    ReturnType<typeof setTimeout>
  >();

  constructor(
    private readonly gameService: GameService,
    private readonly lobbyService: LobbyService,
    private readonly mapsService: MapsService,
  ) {}

  private spectatorRoomId(roomId: RoomId) {
    return `spectators:${roomId}`;
  }

  @SubscribeMessage('initializeGame')
  async handleInitializeGame(@ConnectedSocket() client: Socket) {
    const room = this.lobbyService.getPlayerRoom(client.id);

    if (!room || room.owner !== client.id) {
      return;
    }

    if (room.players.length < MIN_PLAYERS_TO_START) {
      return;
    }

    if (this.gameService.getGame(room.id)) {
      return;
    }

    const map = await this.mapsService.findOneByName(room.map);
    const game = this.gameService.createGame(room.id, room.players, map);

    this.lobbyService.setRunning(room.id);
    this.server.to(room.id).emit('game:opened');
    this.server.to(room.id).emit('game:sync', toGameStatePayload(game));
    this.scheduleGameStart(room.id);
  }

  @OnEvent('room.player.added')
  handleRoomPlayerAdded({ clientId, room }: RoomUpdatedEvent) {
    const player = room.players.find(({ id }) => id === clientId);

    if (!player) {
      return;
    }

    const game = this.gameService.addPlayer(room.id, {
      id: player.id,
      name: player.name,
    });

    if (!game) {
      return;
    }

    this.server.to(clientId).emit('game:opened');
    this.server.to(room.id).emit('game:sync', toGameStatePayload(game));
    this.syncSpectators(game);
  }

  @SubscribeMessage('leaveGame')
  handleLeaveGame(@ConnectedSocket() client: Socket) {
    this.removePlayerFromGame(client.id);
    this.lobbyService.removePlayer(client.id);
  }

  @SubscribeMessage('spectateGame')
  handleSpectateGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId }: SpectateGameDto,
  ) {
    if (this.lobbyService.getPlayerRoom(client.id)) {
      return;
    }

    const room = this.lobbyService.getRoom(roomId);
    const game = this.gameService.getGame(roomId);

    if (
      !room ||
      room.status !== 'running' ||
      !game ||
      game.status === 'ended'
    ) {
      return;
    }

    this.server.in(client.id).socketsJoin(this.spectatorRoomId(roomId));
    this.server.to(client.id).emit('game:spectator:opened');
    this.server
      .to(client.id)
      .emit('game:spectator:sync', toGameStatePayload(game));
  }

  @SubscribeMessage('leaveSpectatorGame')
  handleLeaveSpectatorGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId }: SpectateGameDto,
  ) {
    this.server.in(client.id).socketsLeave(this.spectatorRoomId(roomId));
    this.server.to(client.id).emit('game:left');
  }

  @SubscribeMessage('requestGameState')
  handleRequestGameState(@ConnectedSocket() client: Socket) {
    const game = this.gameService.getPlayerGame(client.id);

    if (!game) {
      return;
    }

    const personalizedStates = this.gameService.getFilteredGameStates(
      toGameStatePayload(game),
    );
    const personalizedState = personalizedStates?.find(
      ({ clientId }) => clientId === client.id,
    );

    if (!personalizedState) {
      return;
    }

    this.server.to(client.id).emit('game:sync', personalizedState.gameState);
  }

  handleDisconnect({ id: clientId }: Socket) {
    this.removePlayerFromGame(clientId);
  }

  private removePlayerFromGame(clientId: ClientId) {
    const game = this.gameService.removePlayer(clientId);

    if (!game) {
      return;
    }

    this.server.to(clientId).emit('game:left');

    if (game.players.length === 0) {
      this.clearTimers(game.roomId);
      // The game is gone, so no further state ever reaches the spectators.
      this.evictSpectators(game.roomId);
      return;
    }

    if (game.status === RUNNING && game.players.length === 1) {
      this.endGame(game.roomId);
      return;
    }

    this.server.to(game.roomId).emit('game:sync', toGameStatePayload(game));
    this.syncSpectators(game);
  }

  // Spectators sit outside the room, so room-wide `game:sync` emits never reach
  // them; without this they keep showing players that already left.
  private syncSpectators(game: GameState) {
    this.server
      .to(this.spectatorRoomId(game.roomId))
      .emit('game:spectator:sync', toGameStatePayload(game));
  }

  private evictSpectators(roomId: RoomId) {
    const spectatorRoom = this.spectatorRoomId(roomId);

    this.server.to(spectatorRoom).emit('game:left');
    this.server.in(spectatorRoom).socketsLeave(spectatorRoom);
  }

  @SubscribeMessage('movePlayer')
  handleMovePlayer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MovePlayerDto,
  ) {
    const room = this.lobbyService.getPlayerRoom(client.id);

    if (!room) {
      return;
    }

    this.gameService.movePlayer(room.id, client.id, payload.direction);
  }

  @SubscribeMessage('playerAttack')
  handlePlayerAttack(@ConnectedSocket() client: Socket) {
    const room = this.lobbyService.getPlayerRoom(client.id);
    if (!room) {
      return;
    }

    const attackResult = this.gameService.playerAttack(room.id, client.id);
    if (!attackResult) {
      return;
    }

    this.server.to(room.id).emit('game:attack', attackResult);
  }

  private endGame(roomId: RoomId) {
    const game = this.gameService.endGame(roomId);

    if (game) {
      this.handleGameEnded(game);
    }
  }

  private clearTimers(roomId: RoomId) {
    const startTimer = this.gameStartTimers.get(roomId);
    const endTimer = this.gameEndTimers.get(roomId);

    if (startTimer) {
      clearTimeout(startTimer);
      this.gameStartTimers.delete(roomId);
    }

    if (endTimer) {
      clearTimeout(endTimer);
      this.gameEndTimers.delete(roomId);
    }
  }

  private scheduleGameStart(roomId: RoomId) {
    if (this.gameStartTimers.has(roomId)) {
      return;
    }

    const timer = setTimeout(() => {
      this.gameStartTimers.delete(roomId);

      const game = this.gameService.startGame(roomId);

      if (game) {
        this.broadcastGamestate(game);

        this.scheduleGameEnd(roomId);
      }
    }, GAME_START_DELAY_MS);

    this.gameStartTimers.set(roomId, timer);
  }

  private scheduleGameEnd(roomId: RoomId) {
    if (this.gameEndTimers.has(roomId)) {
      return;
    }

    const timer = setTimeout(() => {
      this.gameEndTimers.delete(roomId);

      this.endGame(roomId);
    }, GAME_DURATION_MS);

    this.gameEndTimers.set(roomId, timer);
  }

  @OnEvent('game.ended')
  handleGameEnded(gameState: GameState) {
    this.clearTimers(gameState.roomId);
    // Drops the room out of `running` so the lobby stops offering "View".
    this.lobbyService.setFinished(gameState.roomId);

    this.server
      .to(gameState.roomId)
      .emit('game:ended', toGameStatePayload(gameState));
    this.server
      .to(this.spectatorRoomId(gameState.roomId))
      .emit('game:ended', toGameStatePayload(gameState));
  }

  @OnEvent('game.broadcast')
  broadcastGamestate(gameState: GameState) {
    const gameStatePayload = toGameStatePayload(gameState);
    const personalizedStates =
      this.gameService.getFilteredGameStates(gameStatePayload);

    if (!personalizedStates) {
      return;
    }

    for (const { clientId, gameState: filteredState } of personalizedStates) {
      this.server.to(clientId).emit('game:sync', filteredState);
    }

    this.server
      .to(this.spectatorRoomId(gameState.roomId))
      .emit('game:spectator:sync', gameStatePayload);
  }
}
