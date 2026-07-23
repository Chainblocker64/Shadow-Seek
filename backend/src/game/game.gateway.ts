import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { ClientId, RoomId } from '../shared/types';
import { LobbyService } from '../lobby/lobby.service';
import { MapsService } from '../maps/maps.service';
import { GAME_START_DELAY_MS } from './consts';
import { GameService } from './game.service';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL } })
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

  @SubscribeMessage('startGame')
  async handleStartGame(@ConnectedSocket() client: Socket) {
    const room = this.lobbyService.getPlayerRoom(client.id);

    if (!room || room.owner !== client.id) {
      return;
    }

    if (this.gameService.getGame(room.id)) {
      return;
    }

    const map = await this.mapsService.findOneByName(room.map);
    const game = this.gameService.createGame(room.id, room.players, map);

    this.server.to(room.players).emit('game:sync', game);
    this.scheduleGameStart(room.id, room.players);
  }

  private scheduleGameStart(roomId: RoomId, playerIds: ClientId[]) {
    if (this.gameStartTimers.has(roomId)) {
      return;
    }

    const timer = setTimeout(() => {
      this.gameStartTimers.delete(roomId);

      const game = this.gameService.startGame(roomId);

      if (game) {
        this.server.to(playerIds).emit('game:started', game);
      }
    }, GAME_START_DELAY_MS);

    this.gameStartTimers.set(roomId, timer);
  }
}
