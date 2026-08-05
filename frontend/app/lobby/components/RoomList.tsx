import { Room } from "../types";
import RoomListItems from "./RoomListItems";

export default function RoomList({
  rooms,
  handleCreateRoom,
  handleSpectateGame,
  canCreateRoom,
}: {
  rooms: Room[];
  handleCreateRoom: () => void;
  handleSpectateGame: (roomId: Room["id"]) => void;
  canCreateRoom: boolean;
}) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between lg:justify-center">
        <p className="text-lg font-semibold">Join room</p>
        {/* "Create game" button for small screens, inside the room list window */}
        <button
          className="primary-button disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
          onClick={handleCreateRoom}
          disabled={!canCreateRoom}
        >
          Create Game
        </button>
      </div>
      <RoomListItems rooms={rooms} handleSpectateGame={handleSpectateGame} />
      {/* "Create game" button for large screens, outside of the room list window */}
      <button
        className="primary-button absolute left-full top-0 ml-4 hidden whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 lg:block"
        onClick={handleCreateRoom}
        disabled={!canCreateRoom}
      >
        Create Game
      </button>
    </>
  );
}
