import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import type { ClientId, RoomId } from '../shared/types';
import { Server, Socket } from 'socket.io';
import { LobbyService } from './lobby.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { GameService } from '../game/game.service';
import { MapsService } from '../maps/maps.service';
import { GAME_START_DELAY_MS } from '../game/consts';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL } })
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
)
export class LobbyGateway {
  @WebSocketServer()
  server!: Server;

  private readonly gameStartTimers = new Map<
    RoomId,
    ReturnType<typeof setTimeout>
  >();

  constructor(
    private readonly lobbyService: LobbyService,
    private readonly gameService: GameService,
    private readonly mapsService: MapsService,
  ) {}

  handleConnection({ id: clientId }: Socket) {
    this.broadcastRooms(clientId);
  }

  handleDisconnect({ id: clientId }: Socket) {
    this.lobbyService.removePlayer(clientId);
    this.broadcastRooms();
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom({ id: clientId }: Socket) {
    this.lobbyService.createRoom(clientId);
    this.broadcastRooms();
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomDto,
  ) {
    this.lobbyService.addPlayer(client.id, payload.roomId);
    this.broadcastRooms();
  }

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

  broadcastRooms(target: string = '') {
    const rooms = this.lobbyService.getRooms();

    //Turn rooms into an array to make them serializable
    const roomsArray = Array.from(rooms.values());

    if (target) {
      this.server.to(target).emit('rooms:sync', roomsArray);
    } else {
      this.server.emit('rooms:sync', roomsArray);
    }
  }
}
