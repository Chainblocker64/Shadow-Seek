import type { PublicPlayer } from "../../features/game/types/player";

type ListedPlayer = PublicPlayer & {
  isSelf: boolean;
};

function getHealthColor(healthRatio: number): string {
  if (healthRatio <= 0) {
    return "text-zinc-500";
  }

  if (healthRatio <= 0.25) {
    return "text-red-400";
  }

  if (healthRatio <= 0.5) {
    return "text-yellow-400";
  }

  return "text-emerald-400";
}

export default function PlayerList({ players }: { players: ListedPlayer[] }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <h2 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
        Players
      </h2>

      <ul className="flex min-h-0 flex-col gap-1.5 overflow-y-auto">
        {players.map((player) => {
          const healthRatio =
            player.maxHealth > 0 ? player.health / player.maxHealth : 0;

          return (
            <li
              key={player.id}
              className="flex flex-col gap-1 rounded-lg border border-zinc-800 p-2"
            >
              <div className="flex items-center gap-2">
                <span className="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap">
                  {player.name}
                </span>
                {player.isSelf && (
                  <span className="rounded-full bg-emerald-500/20 px-1.5 text-[0.625rem] font-bold text-emerald-400 uppercase">
                    You
                  </span>
                )}
              </div>

              <span
                className={`text-xs font-bold ${getHealthColor(healthRatio)}`}
              >
                {player.health}/{player.maxHealth}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
