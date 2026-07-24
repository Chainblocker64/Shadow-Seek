"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { socket } from "@/lib/socket";
import GameRoom from "../components/GameRoom";
import { useJoinedRoom, useLeaveRoom } from "../RoomProvider";
import { useParams } from "next/navigation";

export default function LobbyRoom() {
  const leaveRoom = useLeaveRoom();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveRoom = () => {
    setIsLeaving(true);
    leaveRoom();
  };

  const joinedRoom = useJoinedRoom();
  const [failedRoomId, setFailedRoomId] = useState<string | null>(null);
  const { roomId } = useParams<{ roomId: string }>();
  const joinFailed = failedRoomId === roomId;

  useEffect(() => {
    const onJoinFailed = () => setFailedRoomId(roomId);
    socket.on("room:join:failed", onJoinFailed);

    if (!joinedRoom) {
      socket.emit("joinRoom", { roomId: roomId });
    }

    return () => {
      socket.off("room:join:failed", onJoinFailed);
    };
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
      ) : isLeaving || !joinFailed ? null : (
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
