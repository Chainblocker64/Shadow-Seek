import { Injectable } from '@nestjs/common';
import {
  ClientId,
  Room,
  RoomId,
  RoomCollection,
  STATUS_WAITING,
} from './types';
import { randomUUID } from 'node:crypto';

@Injectable()
export class LobbyService {
  private readonly rooms: RoomCollection = new Map<RoomId, Room>();

  createRoom(clientId: ClientId) {
    if (this.playerHasRoom(clientId)) {
      return;
    }

    const roomId = randomUUID();

    const room: Room = {
      id: roomId,
      players: [clientId],
      owner: clientId,
      status: STATUS_WAITING,
      maxPlayers: 4,
      map: 'Ancient Forest',
    };

    this.rooms.set(roomId, room);
  }

  addPlayer(clientId: ClientId, roomId: RoomId) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    //TODO case handling / feedback in server response?
    if (this.roomIsFull(room) || room.status !== STATUS_WAITING) {
      return;
    }

    if (this.playerHasRoom(clientId)) {
      return;
    }

    const updatedRoom = {
      ...room,
      players: [...room.players, clientId],
    };

    if (this.roomIsFull(updatedRoom)) {
      updatedRoom.status = 'full';
    }

    this.rooms.set(roomId, updatedRoom);
  }

  getRoom(roomId: RoomId): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRooms(): RoomCollection {
    return this.rooms;
  }

  getPlayerRoom(clientId: ClientId): RoomId | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.includes(clientId)) {
        return room.id;
      }
    }
  }

  playerHasRoom(clientId: ClientId): boolean {
    return Boolean(this.getPlayerRoom(clientId));
  }

  roomIsFull(room: Room): boolean {
    return room.players.length === room.maxPlayers;
  }
}
