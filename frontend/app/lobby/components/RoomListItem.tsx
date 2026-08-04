import Link from "next/link";
import { Room } from "../types";

export default function RoomListItem({
  room,
  handleSpectateGame,
}: {
  room: Room;
  handleSpectateGame: (roomId: Room["id"]) => void;
}) {
  const isWaiting = room.status === "waiting";
  const isRunning = room.status === "running";

  const listItemContent = (
    <>
      <span>{`Room ${room.id} | Players: ${room.players.length}/${room.maxPlayers} | Map: ${room.map}`}</span>
      <span
        className={`room-status-badge ${
          isWaiting ? "room-status-badge-waiting" : "room-status-badge-full"
        }`}
      >
        {room.status}
      </span>
    </>
  );

  if (isWaiting) {
    return (
      <Link
        href={`/lobby/${room.id}`}
        className="room-list-item room-list-item-waiting"
      >
        {listItemContent}
      </Link>
    );
  }

  if (isRunning) {
    return (
      <div className="room-list-item">
        {listItemContent}
        <button
          className="secondary-button ml-auto"
          type="button"
          onClick={() => handleSpectateGame(room.id)}
        >
          View
        </button>
      </div>
    );
  }

  return (
    <div className="room-list-item room-list-item-disabled">
      {listItemContent}
    </div>
  );
}
