import { Room } from "../types";

export default function RoomListItem({ room }: { room: Room }) {
  return (
    <div
      className={`room-list-item ${
        room.status === "waiting"
          ? "room-list-item-waiting"
          : "room-list-item-disabled"
      }`}
      key={room.id}
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
    </div>
  );
}
