import { Room } from "../types";
import { socket } from "@/lib/socket";

export default function RoomListItem({ room }: { room: Room }) {
  const handleJoinRoom = () => {
    socket.emit("joinRoom", { roomId: room.id });
  };

  return (
    <button
      className={`room-list-item ${
        room.status === "waiting"
          ? "room-list-item-waiting"
          : "room-list-item-disabled"
      }`}
      disabled={room.status !== "waiting"}
      onClick={handleJoinRoom}
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
    </button>
  );
}
