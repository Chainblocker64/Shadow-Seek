import { UUID } from 'node:crypto';

export const STATUS_WAITING = 'waiting';
export const STATUS_FULL = 'full';

export type ClientId = string;
export type RoomId = UUID;
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
