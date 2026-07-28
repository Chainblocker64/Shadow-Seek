"use client";

import RoomList from "./components/RoomList";
import { socket } from "@/lib/socket";
import { useRooms } from "./RoomProvider";

export default function Lobby() {
  const rooms = useRooms();

  const handleCreateRoom = () => {
    socket.emit("createRoom");
  };

  return <RoomList handleCreateRoom={handleCreateRoom} rooms={rooms || []} />;
}
