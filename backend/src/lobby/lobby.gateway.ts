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

    this.server.to(clientId).emit('rooms:joined', room);
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
      return;
    }

    this.server.to(clientId).emit('rooms:joined', room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom({ id: clientId }: Socket) {
    const roomModified = this.lobbyService.removePlayer(clientId);

    if (!roomModified) {
      return;
    }

    this.server.to(clientId).emit('rooms:left');
  }

  @OnEvent('rooms.broadcast')
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
