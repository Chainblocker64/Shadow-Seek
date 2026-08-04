"use client";

import RoomList from "./components/RoomList";
import { socket } from "@/lib/socket";
import { useRooms } from "./RoomProvider";
import { useAuthStore } from "../store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "@/features/game/gameSync";

export default function Lobby() {
  const rooms = useRooms();
  const { user } = useAuthStore();
  const username = user?.username;
  const router = useRouter();

  const handleCreateRoom = () => {
    if (!username) {
      return;
    }

    socket.emit("createRoom", { username });
  };

  const handleSpectateGame = (roomId: string) => {
    socket.emit("spectateGame", { roomId });
  };

  useEffect(() => {
    const onSpectatorGameOpened = () => router.push("/game-board");

    socket.on("game:spectator:opened", onSpectatorGameOpened);
    return () => {
      socket.off("game:spectator:opened", onSpectatorGameOpened);
    };
  }, [router]);

  return (
    <RoomList
      handleCreateRoom={handleCreateRoom}
      handleSpectateGame={handleSpectateGame}
      canCreateRoom={Boolean(username)}
      rooms={rooms || []}
    />
  );
}
