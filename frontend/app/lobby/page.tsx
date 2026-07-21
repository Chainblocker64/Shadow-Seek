"use client";

import { useEffect, useState } from "react";
import RoomList from "./components/RoomList";
import { socket } from "@/lib/socket";
import { Room } from "./types";

export default function Lobby() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    socket.connect();

    const onRoomsSync = (rooms: Room[]) => {
      setRooms(rooms);
    };

    socket.on("rooms:sync", onRoomsSync);

    return () => {
      socket.off("rooms:sync", onRoomsSync);
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = () => {
    socket.emit("createRoom");
  };

  return (
    <main className="flex w-full flex-1 flex-col items-center px-6 py-10">
      <div className="flex w-full max-w-6xl flex-1 flex-col px-6 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <RoomList handleCreateRoom={handleCreateRoom} rooms={rooms} />
        </div>
      </div>
    </main>
  );
}
