import type { ClientId, RoomId } from '../shared/types';

export const STATUS_WAITING = 'waiting';
export const STATUS_FULL = 'full';

export type RoomStatus = typeof STATUS_WAITING | typeof STATUS_FULL;
export type RoomCollection = Map<RoomId, Room>;

export interface Room {
  id: RoomId;
  players: ClientId[];
  owner: ClientId;
  status: RoomStatus;
  maxPlayers: number;
  map: string;
}
