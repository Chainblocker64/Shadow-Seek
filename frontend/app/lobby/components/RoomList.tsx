"use client";
import { useEffect, useState } from "react";
import { Room } from "../types";
import { socket } from "@/lib/socket";
import RoomListItems from "./RoomListItems";

export default function RoomList() {
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
    <div className="relative px-4 sm:px-6 lg:px-8 py-8 outline outline-white/30 rounded-3xl flex flex-1 flex-col">
      <div className="mb-6 flex items-center justify-between lg:justify-center">
        <p className="text-lg font-semibold">Join room</p>
        {/* "Create game" button for small screens, inside the room list window */}
        <button className="primary-button lg:hidden" onClick={handleCreateRoom}>
          Create Game
        </button>
      </div>
      <RoomListItems rooms={rooms} />
      {/* "Create game" button for large screens, outside of the room list window */}
      <button
        className="primary-button absolute left-full top-0 ml-4 hidden whitespace-nowrap lg:block"
        onClick={handleCreateRoom}
      >
        Create Game
      </button>
    </div>
  );
}
