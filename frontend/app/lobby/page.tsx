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
  ];
  return (
    <main className="hero">
      <div className="page-content">
        <p>Join room</p>
        {rooms.map((room) => (
          <div
            key={room.id}
          >{`Room ${room.id} | Players: ${room.players.length}/${room.maxPlayers} | Map: ${room.map}`}</div>
        ))}
      </div>
    </main>
  );
}
