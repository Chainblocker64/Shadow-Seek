"use client";

import { useEffect } from "react";
import Link from "next/link";
import { socket } from "@/lib/socket";
import GameRoom from "../components/GameRoom";
import { useJoinedRoom } from "../RoomProvider";
import { useParams } from "next/navigation";

export default function LobbyRoom() {
  const handleLeaveRoom = () => {
    socket.emit("leaveRoom");
  };

  const joinedRoom = useJoinedRoom();
  const { roomId } = useParams<{ roomId: string }>();

  useEffect(() => {
    if (!joinedRoom) {
      socket.emit("joinRoom", { roomId: roomId });
    }
    /* We do not want to have joinedRoom in the dependencies since we don't want to re-trigger
     this after we set joinedRoom to undefined when leaving the room for example
     So, disable lint warning that wants us to include joinedRoom */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  return (
    <>
      {joinedRoom ? (
        <GameRoom
          room={joinedRoom}
          handleLeaveRoom={handleLeaveRoom}
          isOwner={socket.id === joinedRoom.owner}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-zinc-100">
            Could not join room
          </p>
          <p className="text-zinc-400">
            The room may be full, no longer exist, or already have started.
          </p>
          <Link href="/lobby" className="primary-link">
            Back to Lobby
          </Link>
        </div>
      )}
    </>
  );
}
