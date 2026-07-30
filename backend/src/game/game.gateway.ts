import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { RoomId } from '../shared/types';
import { LobbyService } from '../lobby/lobby.service';
import { MapsService } from '../maps/maps.service';
import { GAME_START_DELAY_MS, MIN_PLAYERS_TO_START } from './consts';
import { GameService } from './game.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { MovePlayerDto } from './dto/move-player.dto';
import { OnEvent } from '@nestjs/event-emitter';
import type { GameState } from './types';

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

  constructor(
    private readonly gameService: GameService,
    private readonly lobbyService: LobbyService,
    private readonly mapsService: MapsService,
  ) {}

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

    this.server.to(room.id).emit('game:opened');
    this.server.to(room.id).emit('game:sync', game);
    this.scheduleGameStart(room.id);
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

    const result = this.gameService.movePlayer(
      room.id,
      client.id,
      payload.direction,
    );

    if (!result) {
      return;
    }

    this.server.to(room.id).emit('movement:confirmed', result);
  }

  @SubscribeMessage('playerAttack')
  handlePlayerAttack({ id: clientId }: Socket) {
    const room = this.lobbyService.getPlayerRoom(clientId);

    if (!room) {
      return;
    }

    this.gameService.playerAttack(room.id, clientId);
  }

  private scheduleGameStart(roomId: RoomId) {
    if (this.gameStartTimers.has(roomId)) {
      return;
    }

    const timer = setTimeout(() => {
      this.gameStartTimers.delete(roomId);

      const game = this.gameService.startGame(roomId);

      if (game) {
        this.broadcastGamestate(roomId, game);
      }
    }, GAME_START_DELAY_MS);

    this.gameStartTimers.set(roomId, timer);
  }

  @OnEvent('game.broadcast')
  broadcastGamestate(roomId: RoomId, gameState: GameState) {
    this.server.to(roomId).emit('game:sync', gameState);
  }
}
