import { Room } from "../types";
import { socket } from "@/lib/socket";

type RoomListItemProps = {
  room: Room;
  isOwner: boolean;
};

export default function RoomListItem({ room, isOwner }: RoomListItemProps) {
  const canInitializeGame = room.players.length >= 2;

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
        <span className="group relative inline-block">
          <button
            className={
              canInitializeGame
                ? "primary-button"
                : "secondary-button cursor-not-allowed opacity-50"
            }
            disabled={!canInitializeGame}
            onClick={handleInitializeGame}
          >
            Start
          </button>
          {!canInitializeGame && (
            <span
              className="absolute top-full hidden bg-zinc-800 p-2 text-sm group-hover:block"
              role="tooltip"
            >
              At least 2 players are needed to start the game.
            </span>
          )}
        </span>
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
