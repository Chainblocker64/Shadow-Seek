import Link from "next/link";
import { Room } from "../types";

export default function RoomListItem({ room }: { room: Room }) {
  const isWaiting = room.status === "waiting";

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

  return (
    <div className="room-list-item room-list-item-disabled">
      {listItemContent}
    </div>
  );
}
