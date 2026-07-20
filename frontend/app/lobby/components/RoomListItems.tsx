import { Room } from "../types";
import RoomListItem from "./RoomListItem";

export default function RoomListItems({ rooms }: { rooms: Room[] }) {
  return (
    <div className="flex flex-col gap-3">
      {rooms.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-700 px-8 py-6 text-center text-sm text-zinc-500">
          No rooms waiting, create a game to start playing
        </p>
      ) : (
        rooms.map((room) => <RoomListItem key={room.id} room={room} />)
      )}
    </div>
  );
}
