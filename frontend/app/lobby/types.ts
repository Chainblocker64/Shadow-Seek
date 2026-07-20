export type ClientID = string;
export type Status = "waiting" | "full";

export interface Room {
  id: number;
  players: ClientID[];
  owner: ClientID;
  status: Status;
  maxPlayers: number;
  map: string;
}
