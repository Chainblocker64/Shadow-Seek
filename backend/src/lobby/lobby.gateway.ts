import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { LobbyService } from './lobby.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { RoomUpdatedEvent } from './events/room-updated.event';

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

  constructor(private readonly lobbyService: LobbyService) {}

  handleConnection({ id: clientId }: Socket) {
    this.broadcastRooms(clientId);
  }

  handleDisconnect({ id: clientId }: Socket) {
    this.lobbyService.removePlayer(clientId);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom({ id: clientId }: Socket) {
    const room = this.lobbyService.createRoom(clientId);

    if (!room) {
      return;
    }

    this.server.to(clientId).emit('room:joined', room);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomDto,
  ) {
    const clientId = client.id;
    const roomId = payload.roomId;

    const room = this.lobbyService.addPlayer(clientId, roomId);

    if (!room) {
      this.server.to(clientId).emit('room:join:failed');
      return;
    }

    this.server.to(clientId).emit('room:joined', room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom({ id: clientId }: Socket) {
    this.lobbyService.removePlayer(clientId);
    this.server.to(clientId).emit('room:left');
  }

  //NestJS event listeners

  @OnEvent('room.broadcast')
  broadcastRooms(target: string = '') {
    const rooms = this.lobbyService.getRooms();

    //Turn rooms into an array to make them serializable
    const roomsArray = Array.from(rooms.values());

    if (target) {
      this.server.to(target).emit('room:sync', roomsArray);
    } else {
      this.server.emit('room:sync', roomsArray);
    }
  }

  @OnEvent('room.player.added')
  joinWebsocketRoom({ clientId, room }: RoomUpdatedEvent) {
    const roomId = room.id;
    this.server.in(clientId).socketsJoin(roomId);
    this.server.to(roomId).emit('room:updated', room);
  }

  @OnEvent('room.player.removed')
  leaveWebsocketRoom({ clientId, room }: RoomUpdatedEvent) {
    const roomId = room.id;
    this.server.in(clientId).socketsLeave(roomId);
    this.server.to(clientId).emit('room:left');
    this.server.to(roomId).emit('room:updated', room);
  }
}
