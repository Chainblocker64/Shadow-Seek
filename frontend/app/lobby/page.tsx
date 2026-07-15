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
      players: ["player3", "player4", "player5"],
      status: "waiting",
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
              <button className="whitespace-nowrap rounded-lg border border-white/20 bg-transparent px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10 lg:hidden">
                Create Game
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {rooms.map((room) => (
                <div
                  className="room-list-item"
                  key={room.id}
                >{`Room ${room.id} | Players: ${room.players.length}/${room.maxPlayers} | Map: ${room.map}`}</div>
              ))}
            </div>
          </div>
          <button className="absolute left-full top-0 ml-4 hidden w-36 whitespace-nowrap rounded-lg border border-white/20 bg-transparent px-6 py-2 font-semibold text-white transition hover:bg-white/10 lg:block">
            Create Game
          </button>
        </div>
      </div>
    </main>
  );
}
