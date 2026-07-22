import { Injectable } from '@nestjs/common';
import {
  ClientId,
  Room,
  RoomId,
  RoomCollection,
  STATUS_WAITING,
  STATUS_FULL,
} from './types';
import { randomUUID } from 'node:crypto';

@Injectable()
export class LobbyService {
  private readonly rooms: RoomCollection = new Map<RoomId, Room>();

  createRoom(clientId: ClientId): RoomId | undefined {
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
    return roomId;
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

    updatedRoom.status = this.newRoomStatus(updatedRoom);

    this.rooms.set(roomId, updatedRoom);
  }

  removePlayer(clientId: ClientId) {
    const room = this.getPlayerRoom(clientId);

    if (!room) {
      return;
    }

    const roomId = room.id;

    const updatedPlayers = room.players.filter((player) => player !== clientId);

    if (updatedPlayers.length === 0) {
      this.rooms.delete(roomId);
      return;
    }

    const updatedRoom = { ...room, players: updatedPlayers };

    updatedRoom.status = this.newRoomStatus(updatedRoom);

    this.rooms.set(roomId, updatedRoom);
  }

  getRoom(roomId: RoomId): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRooms(): RoomCollection {
    return this.rooms;
  }

  getPlayerRoom(clientId: ClientId): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.includes(clientId)) {
        return room;
      }
    }
  }

  playerHasRoom(clientId: ClientId): boolean {
    return Boolean(this.getPlayerRoom(clientId));
  }

  roomIsFull(room: Room): boolean {
    return room.players.length === room.maxPlayers;
  }

  newRoomStatus(room: Room) {
    return this.roomIsFull(room) ? STATUS_FULL : STATUS_WAITING;
  }
}
