import { Header } from "../components/Header";

export default function Lobby() {
  const rooms = [
    {
      id: 155,
      players: ["player1", "player2"],
      status: "waiting",
      maxPlayers: 4,
      map: "Forest",
    },
    {
      id: 156,
      players: ["player3", "player4", "player5"],
      status: "waiting",
      maxPlayers: 4,
      map: "Forest",
    },
    {
      id: 1565,
      players: ["player6", "player7", "player8", "player9"],
      status: "full",
      maxPlayers: 4,
      map: "Desert and Savannas",
    },
  ];
  return (
    <main className="flex w-full flex-1 flex-col items-center gap-8 px-6 py-10">
      <Header />
      <div className="flex w-full max-w-6xl flex-1 flex-col px-6 py-8 sm:px-10">
        <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <div className="px-4 sm:px-6 lg:px-8 py-8 outline outline-white/30 rounded-3xl flex flex-1 flex-col">
            <div className="mb-6 flex items-center justify-between lg:justify-center">
              <p className="text-lg font-semibold">Join room</p>
              <button className="primary-button lg:hidden">Create Game</button>
            </div>
            <div className="flex flex-col gap-3">
              {rooms.map((room) => (
                <div
                  className={`room-entry ${
                    room.status === "waiting"
                      ? "room-entry-waiting"
                      : "room-entry-disabled"
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
              ))}
            </div>
          </div>
          <button className="primary-button absolute left-full top-0 ml-4 hidden whitespace-nowrap lg:block">
            Create Game
          </button>
        </div>
      </div>
    </main>
  );
}
