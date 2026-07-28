"use client";

import RoomList from "./components/RoomList";
import { socket } from "@/lib/socket";
import { useRooms } from "./RoomProvider";
import { useAuthStore } from "../store/useAuthStore";

export default function Lobby() {
  const rooms = useRooms();
  const { user } = useAuthStore();
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
