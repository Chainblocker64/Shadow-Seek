import { Room } from "../types";

const mockRoomName = "Room XYZ";
const mockMaxPlayers = 4;
const mockMap = "Forest";
const mockPlayers = ["Sergey", "Marcel", "Keno", "Chris"];

export default function GameRoom({
  room,
  handleLeaveRoom,
}: {
  room: Room;
  handleLeaveRoom: () => void;
}) {
  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex items-center gap-4">
        <button className="secondary-link" onClick={handleLeaveRoom}>
          &#8592;
        </button>
        <p className="text-lg font-semibold">{mockRoomName}</p>
      </div>

      <div className="mt-4 flex flex-col gap-1 text-zinc-300">
        <p>
          Players: {mockPlayers.length}/{mockMaxPlayers}
        </p>
        <p>Map: {mockMap}</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        {mockPlayers.map((player) => (
          <p key={player}>{player}</p>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="primary-button">Start Game</button>
      </div>
    </div>
  );
}
