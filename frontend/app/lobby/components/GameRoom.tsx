import { Room } from "../types";

export default function GameRoom({
  room,
  handleLeaveRoom,
  isOwner,
}: {
  room: Room;
  handleLeaveRoom: () => void;
  isOwner: boolean;
}) {
  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex items-center gap-4">
        <button className="secondary-link" onClick={handleLeaveRoom}>
          &#8592;
        </button>
        <p className="text-lg font-semibold">Room {room.id}</p>
      </div>

      <div className="mt-4 flex flex-col gap-1 text-zinc-300">
        <p>
          Players: {room.players.length}/{room.maxPlayers}
        </p>
        <p>Map: {room.map}</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        {room.players.map((player) => (
          <p key={player}>{player}</p>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="primary-button">Start Game</button>
      </div>
    </div>
  );
}
