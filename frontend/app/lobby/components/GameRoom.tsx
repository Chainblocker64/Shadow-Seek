import { Room } from "../types";

export default function GameRoom({
  room,
  handleLeaveRoom,
  isOwner,
  handleInitializeGame,
}: {
  room: Room;
  handleLeaveRoom: () => void;
  isOwner: boolean;
  handleInitializeGame: () => void;
}) {
  const canInitializeGame = room.players.length >= 2;
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
      <ul className="flex flex-1 flex-col items-center justify-center gap-2">
        {room.players.map((player) => (
          <li key={player.id} className="flex items-center gap-1.5">
            {player.id === room.owner && (
              <svg
                className="h-4 w-4 text-yellow-400"
                viewBox="0 0 24 24"
                fill="currentColor"
                role="img"
                aria-label="Room owner"
              >
                <path d="M5 18h14l1.5-9-5 3-3.5-6-3.5 6-5-3L5 18Z" />
              </svg>
            )}
            {player.name}
          </li>
        ))}
      </ul>
      {isOwner && (
        <div className="flex justify-end">
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
      )}
    </div>
  );
}
