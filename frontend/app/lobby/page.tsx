"use client";

import RoomList from "./components/RoomList";
import { socket } from "@/lib/socket";
import { useRooms } from "./RoomProvider";
import { useAuth } from "../hooks/useAuth";

export default function Lobby() {
  const rooms = useRooms();
  const { user } = useAuth();
  const username = user?.username;

  const handleCreateRoom = () => {
    if (!username) {
      return;
    }

    socket.emit("createRoom", { username });
  };

  return (
    <RoomList
      handleCreateRoom={handleCreateRoom}
      canCreateRoom={Boolean(username)}
      rooms={rooms || []}
    />
  );
}
