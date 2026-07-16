"use client";
import { useEffect, useState } from "react";
import { Room } from "../types";
import { socket } from "@/lib/socket";

export default function RoomList({ initialRooms }: { initialRooms: Room[] }) {
  const [rooms, setRooms] = useState(initialRooms);

  useEffect(() => {
    socket.connect();

    const onRoomsUpdated = (rooms: Room[]) => {
      setRooms(rooms);
    };

    socket.on("roomsUpdated", onRoomsUpdated);

    return () => {
      socket.off("roomsUpdated", onRoomsUpdated);
      socket.disconnect();
    };
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 outline outline-white/30 rounded-3xl flex flex-1 flex-col">
      <div className="mb-6 flex items-center justify-between lg:justify-center">
        <p className="text-lg font-semibold">Join room</p>
        <button className="primary-button lg:hidden">Create Game</button>
      </div>
      <div className="flex flex-col gap-3">
        {rooms.map((room) => (
          <div
            className={`room-entry ${
              room.status === "waiting"
                ? "room-entry-waiting"
                : "room-entry-disabled"
            }`}
            key={room.id}
          >
            <span>{`Room ${room.id} | Players: ${room.players.length}/${room.maxPlayers} | Map: ${room.map}`}</span>
            <span
              className={`room-status-badge ${
                room.status === "waiting"
                  ? "room-status-badge-waiting"
                  : "room-status-badge-full"
              }`}
            >
              {room.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
