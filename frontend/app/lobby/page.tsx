"use client";

import AuthGuard from "../components/AuthGuard";
import RoomList from "./components/RoomList";
import { socket } from "@/lib/socket";
import { useRooms } from "./RoomProvider";

export default function Lobby() {
  const rooms = useRooms();

  const handleCreateRoom = () => {
    socket.emit("createRoom");
  };

  return (
    <AuthGuard>
      <RoomList handleCreateRoom={handleCreateRoom} rooms={rooms || []} />
    </AuthGuard>
  );
}
