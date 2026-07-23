import { ClientId, Room } from '../types';

export class RoomUpdatedEvent {
  constructor(
    public readonly clientId: ClientId,
    public readonly room: Room,
  ) {}
}
