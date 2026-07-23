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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RoomUpdatedEvent } from './events/room-updated.event';

@Injectable()
export class LobbyService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  private readonly rooms: RoomCollection = new Map<RoomId, Room>();

  createRoom(clientId: ClientId): Room | undefined {
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
    this.triggerPlayerAdded(clientId, room);
    this.triggerRoomBroadcast();
    return room;
  }

  addPlayer(clientId: ClientId, roomId: RoomId): Room | undefined {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    //TODO case handling / feedback in server response?
    if (
      this.roomIsFull(room) ||
      room.status !== STATUS_WAITING ||
      this.playerHasRoom(clientId)
    ) {
      return;
    }

    const updatedRoom = {
      ...room,
      players: [...room.players, clientId],
    };

    updatedRoom.status = this.newRoomStatus(updatedRoom);

    this.rooms.set(roomId, updatedRoom);

    this.triggerPlayerAdded(clientId, updatedRoom);
    this.triggerRoomBroadcast();

    return updatedRoom;
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
      this.triggerRoomBroadcast();
      return;
    }

    const clientWasOwner = room.owner === clientId;

    const updatedRoom = {
      ...room,
      players: updatedPlayers,
      owner: clientWasOwner ? updatedPlayers[0] : room.owner,
    };

    updatedRoom.status = this.newRoomStatus(updatedRoom);

    this.rooms.set(roomId, updatedRoom);

    this.triggerPlayerRemoved(clientId, updatedRoom);
    this.triggerRoomBroadcast();
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

  triggerRoomBroadcast() {
    this.eventEmitter.emit('room.broadcast');
  }

  triggerPlayerAdded(clientId: ClientId, room: Room) {
    this.eventEmitter.emit(
      'room.player.added',
      new RoomUpdatedEvent(clientId, room),
    );
  }

  triggerPlayerRemoved(clientId: ClientId, room: Room) {
    this.eventEmitter.emit(
      'room.player.removed',
      new RoomUpdatedEvent(clientId, room),
    );
  }
}
