import type { UUID } from "node:crypto";

export type ClientId = string;
export type RoomId = UUID;
export type RoomStatus = "waiting" | "full";

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
