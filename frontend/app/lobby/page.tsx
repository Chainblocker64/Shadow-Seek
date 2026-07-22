"use client";

import { useEffect, useState } from "react";
import RoomList from "./components/RoomList";
import { socket } from "@/lib/socket";
import { Room } from "./types";
import GameRoom from "./components/GameRoom";

export default function Lobby() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [joinedRoom, setJoinedRoom] = useState<Room | undefined>(undefined);

  useEffect(() => {
    socket.connect();

    const onRoomsSync = (rooms: Room[]) => {
      setRooms(rooms);
    };

    const onRoomsJoined = (room: Room) => {
      setJoinedRoom(room);
    };

    const onRoomsLeft = () => {
      setJoinedRoom(undefined);
    };

    socket.on("rooms:sync", onRoomsSync);
    socket.on("rooms:joined", onRoomsJoined);
    socket.on("rooms:left", onRoomsLeft);

    return () => {
      socket.off("rooms:sync", onRoomsSync);
      socket.off("rooms:joined", onRoomsJoined);
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = () => {
    socket.emit("createRoom");
  };

  const handleLeaveRoom = () => {
    socket.emit("leaveRoom");
  };

  return (
    <main className="flex w-full flex-1 flex-col items-center px-6 py-10">
      <div className="flex w-full max-w-6xl flex-1 flex-col px-6 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <div className="relative px-4 sm:px-6 lg:px-8 py-8 outline outline-white/30 rounded-3xl flex flex-1 flex-col">
            {joinedRoom ? (
              <GameRoom room={joinedRoom} handleLeaveRoom={handleLeaveRoom} />
            ) : (
              <RoomList handleCreateRoom={handleCreateRoom} rooms={rooms} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
