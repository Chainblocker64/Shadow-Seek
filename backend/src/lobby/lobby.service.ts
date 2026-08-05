import { Injectable } from '@nestjs/common';
import {
  Room,
  RoomCollection,
  RoomPlayer,
  STATUS_WAITING,
  STATUS_FULL,
  STATUS_RUNNING,
  STATUS_FINISHED,
  RoomStatus,
} from './types';
import { randomUUID } from 'node:crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RoomUpdatedEvent } from './events/room-updated.event';
import type { ClientId, RoomId } from '../shared/types';

@Injectable()
export class LobbyService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  private readonly rooms: RoomCollection = new Map<RoomId, Room>();

  createRoom(clientId: ClientId, username: string): Room | undefined {
    if (this.playerHasRoom(clientId)) {
      return;
    }

    const roomId = randomUUID();

    const room: Room = {
      id: roomId,
      players: [{ id: clientId, name: username }],
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

  addPlayer(
    clientId: ClientId,
    roomId: RoomId,
    username: string,
  ): Room | undefined {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    if (this.roomHasPlayer(room, clientId)) {
      return room;
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
      players: [...room.players, { id: clientId, name: username }],
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
      this.triggerPlayerRemoveSkipped(clientId);
      return;
    }

    const roomId = room.id;
    const updatedPlayers = room.players.filter(
      (player) => player.id !== clientId,
    );

    if (updatedPlayers.length === 0) {
      this.rooms.delete(roomId);
      this.triggerRoomDeleted(clientId);
      this.triggerRoomBroadcast();
      return;
    }

    const clientWasOwner = room.owner === clientId;

    const updatedRoom = {
      ...room,
      players: updatedPlayers,
      owner: clientWasOwner ? updatedPlayers[0].id : room.owner,
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

  setRunning(roomId: RoomId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    this.rooms.set(roomId, {
      ...room,
      status: STATUS_RUNNING,
    });
    this.triggerRoomBroadcast();
  }

  setFinished(roomId: RoomId) {
    const room = this.rooms.get(roomId);

    if (!room || room.status === STATUS_FINISHED) {
      return;
    }

    this.rooms.set(roomId, {
      ...room,
      status: STATUS_FINISHED,
    });
    this.triggerRoomBroadcast();
  }

  getPlayerRoom(clientId: ClientId): Room | undefined {
    for (const room of this.rooms.values()) {
      if (this.roomHasPlayer(room, clientId)) {
        return room;
      }
    }
  }

  roomHasPlayer(room: Room, clientId: ClientId): boolean {
    return room.players.some((player: RoomPlayer) => player.id === clientId);
  }

  playerHasRoom(clientId: ClientId): boolean {
    return Boolean(this.getPlayerRoom(clientId));
  }

  roomIsFull(room: Room): boolean {
    return room.players.length === room.maxPlayers;
  }

  private newRoomStatus(room: Room): RoomStatus {
    // A room that started or finished a game never falls back to a joinable
    // status, no matter how many players come and go.
    if (room.status === STATUS_RUNNING || room.status === STATUS_FINISHED) {
      return room.status;
    }
    return this.roomIsFull(room) ? STATUS_FULL : STATUS_WAITING;
  }

  private triggerRoomBroadcast() {
    this.eventEmitter.emit('room.broadcast');
  }

  private triggerPlayerAdded(clientId: ClientId, room: Room) {
    this.eventEmitter.emit(
      'room.player.added',
      new RoomUpdatedEvent(clientId, room),
    );
  }

  private triggerPlayerRemoved(clientId: ClientId, room: Room) {
    this.eventEmitter.emit(
      'room.player.removed',
      new RoomUpdatedEvent(clientId, room),
    );
  }

  private triggerRoomDeleted(clientId: ClientId) {
    this.eventEmitter.emit('room.deleted', clientId);
  }

  private triggerPlayerRemoveSkipped(clientId: ClientId) {
    this.eventEmitter.emit('room.player.removeSkipped', clientId);
  }
}
