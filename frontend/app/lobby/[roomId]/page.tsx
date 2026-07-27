"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { socket } from "@/lib/socket";
import GameRoom from "../components/GameRoom";
import { useJoinedRoom, useLeaveRoom } from "../RoomProvider";
import { useParams, useRouter } from "next/navigation";
import "@/features/game/gameSync";
import { RoomId } from "../types";

export default function LobbyRoom() {
  const leaveRoom = useLeaveRoom();
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveRoom = () => {
    setIsLeaving(true);
    leaveRoom();
  };

  const handleInitializeGame = () => {
    socket.emit("initializeGame");
  };

  const joinRoom = (roomId: RoomId) => {
    socket.emit("joinRoom", { roomId: roomId });
  };

  const joinedRoom = useJoinedRoom();
  const [failedRoomId, setFailedRoomId] = useState<RoomId | null>(null);
  const { roomId } = useParams<{ roomId: RoomId }>();
  const joinFailed = failedRoomId === roomId;

  useEffect(() => {
    const onGameOpened = () => {
      router.push("/game-board");
    };

    socket.on("game:opened", onGameOpened);

    return () => {
      socket.off("game:opened", onGameOpened);
    };
  }, [router]);

  useEffect(() => {
    const onJoinFailed = () => setFailedRoomId(roomId);
    socket.on("room:join:failed", onJoinFailed);

    if (!joinedRoom) {
      joinRoom(roomId);
    }

    if (roomId !== joinedRoom?.id) {
      socket.emit("leaveRoom");
      joinRoom(roomId);
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
          handleInitializeGame={handleInitializeGame}
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
