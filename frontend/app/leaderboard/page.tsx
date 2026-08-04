"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  username: string;
  wins: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leaderboard`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load leaderboard");
        }
        return res.json() as Promise<LeaderboardEntry[]>;
      })
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load leaderboard",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <h1 className="mb-6 text-center text-3xl font-bold text-white">
        Leaderboard
      </h1>

      {loading && <p className="text-center text-zinc-400">Loading...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && !error && entries.length === 0 && (
        <p className="text-center text-zinc-400">No wins recorded yet.</p>
      )}

      {!loading && !error && entries.length > 0 && (
        <ol className="flex flex-col gap-3">
          {entries.map((entry, index) => (
            <li key={entry.username} className="room-list-item">
              <span>
                <span className="mr-3 text-zinc-500">#{index + 1}</span>
                {entry.username}
              </span>
              <span className="room-status-badge room-status-badge-waiting">
                {entry.wins} {entry.wins === 1 ? "win" : "wins"}
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
