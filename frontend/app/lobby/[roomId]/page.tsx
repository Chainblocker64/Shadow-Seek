"use client";

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

  if (!joinedRoom) {
    socket.emit("joinRoom", { roomId: roomId });
    console.log("emit join room");
  }

  return (
    <>
      {joinedRoom ? (
        <GameRoom
          room={joinedRoom}
          handleLeaveRoom={handleLeaveRoom}
          isOwner={socket.id === joinedRoom.owner}
        />
      ) : (
        <p>Could not join room</p>
      )}
    </>
  );
}
