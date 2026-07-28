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
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { RoomUpdatedEvent } from './events/room-updated.event';
import type { ClientId } from '../shared/types';

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
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateRoomDto,
  ) {
    const room = this.lobbyService.createRoom(client.id, payload.username);

    if (!room) {
      return;
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomDto,
  ) {
    const clientId = client.id;
    const roomId = payload.roomId;

    const room = this.lobbyService.addPlayer(clientId, roomId, payload.username);

    if (!room) {
      this.server.to(clientId).emit('room:join:failed');
      return;
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom({ id: clientId }: Socket) {
    this.lobbyService.removePlayer(clientId);
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

  @OnEvent(['room.deleted', 'room.player.removeSkipped'])
  emitPlayerLeft(clientId: ClientId) {
    this.server.to(clientId).emit('room:left');
  }
}
