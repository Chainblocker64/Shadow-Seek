import { Room } from "../types";
import { socket } from "@/lib/socket";

type RoomListItemProps = {
  room: Room;
  isOwner: boolean;
};

export default function RoomListItem({ room, isOwner }: RoomListItemProps) {
  const handleJoinRoom = () => {
    socket.emit("joinRoom", { roomId: room.id });
  };

  const handleInitializeGame = () => {
    socket.emit("initializeGame", { roomId: room.id });
  };

  const roomDetails = (
    <>
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
    </>
  );

  if (isOwner) {
    return (
      <div className="room-list-item">
        {roomDetails}
        <button className="primary-button" onClick={handleInitializeGame}>
          Start
        </button>
      </div>
    );
  }

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
      {roomDetails}
    </button>
  );
}
