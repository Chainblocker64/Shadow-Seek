import { UUID } from "node:crypto";

export type ClientId = string;
export type RoomId = UUID;
export type RoomStatus = "waiting" | "full";

export interface Room {
  id: RoomId;
  players: ClientId[];
  owner: ClientId;
  status: RoomStatus;
  maxPlayers: number;
  map: string;
}
