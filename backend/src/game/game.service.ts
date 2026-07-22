import { Injectable } from '@nestjs/common';
import { ClientId } from './types';
import { RoomId } from '../lobby/types';

@Injectable()
export class GameService {
  createGame(clientId: ClientId, roomId: RoomId, mapName: string) {}
}
