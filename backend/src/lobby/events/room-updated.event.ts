import { Room } from '../types';
import { ClientId } from '../../shared/types';

export class RoomUpdatedEvent {
  constructor(
    public readonly clientId: ClientId,
    public readonly room: Room,
  ) {}
}
