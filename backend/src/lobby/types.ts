import type { ClientId, RoomId } from '../shared/types';

export const STATUS_WAITING = 'waiting';
export const STATUS_FULL = 'full';
export const STATUS_RUNNING = 'running';

export type RoomStatus =
  typeof STATUS_WAITING | typeof STATUS_FULL | typeof STATUS_RUNNING;
export type RoomCollection = Map<RoomId, Room>;

export interface RoomPlayer {
  id: ClientId;
  name: string;
}

export interface Room {
  id: RoomId;
  players: RoomPlayer[];
  owner: ClientId;
  status: RoomStatus;
  maxPlayers: number;
  map: string;
}
