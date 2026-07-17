import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LobbyService } from './lobby.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class LobbyGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly lobbyService: LobbyService) {}

  handleConnection({ id: clientId }: Socket) {
    this.broadcastRooms(clientId);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom({ id: clientId }: Socket) {
    this.lobbyService.createRoom(clientId);
    this.broadcastRooms();
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
