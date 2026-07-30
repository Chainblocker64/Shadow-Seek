type ListedPlayer = {
  id: string;
  label: string;
  isSelf: boolean;
};

export default function PlayerList({ players }: { players: ListedPlayer[] }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <h2 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
        Players
      </h2>

      <ul className="flex min-h-0 flex-col gap-1.5 overflow-y-auto">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 p-2"
          >
            <span className="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap">
              {player.label}
            </span>
            {player.isSelf && (
              <span className="rounded-full bg-emerald-500/20 px-1.5 text-[0.625rem] font-bold uppercase text-emerald-400">
                You
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
