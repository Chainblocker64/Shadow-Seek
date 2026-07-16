import RoomList from "./components/RoomList";
import { Room } from "./types";

export default function Lobby() {
  const rooms: Room[] = [
    {
      id: 155,
      players: ["player1", "player2"],
      owner: "player1",
      status: "waiting",
      maxPlayers: 4,
      map: "Forest",
    },
    {
      id: 156,
      players: ["player3", "player4", "player5"],
      owner: "player4",
      status: "waiting",
      maxPlayers: 4,
      map: "Forest",
    },
    {
      id: 1565,
      players: ["player6", "player7", "player8", "player9"],
      owner: "player9",
      status: "full",
      maxPlayers: 4,
      map: "Desert and Savannas",
    },
  ];

  return (
    <main className="flex w-full flex-1 flex-col items-center px-6 py-10">
      <div className="flex w-full max-w-6xl flex-1 flex-col px-6 py-8 sm:px-10">
        <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <RoomList initialRooms={rooms} />
          <button className="primary-button absolute left-full top-0 ml-4 hidden whitespace-nowrap lg:block">
            Create Game
          </button>
        </div>
      </div>
    </main>
  );
}
