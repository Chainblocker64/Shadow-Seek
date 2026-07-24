"use client";

import { useEffect, useState } from "react";
import { PixiGameBoard } from "../../features/game/components/PixiGameBoard";
import type { GameState } from "../../features/game/types/game";
import { socket } from "@/lib/socket";
import { getLatestGame } from "../../features/game/gameSync";
import { useAuth } from "../hooks/useAuth";
import styles from "./GameBoardPage.module.css";

// Mirrors the backend's GAME_START_DELAY_MS (backend/src/game/consts.ts).
const GAME_START_COUNTDOWN_SECONDS = 3;

export default function GameBoard() {
  const { user } = useAuth();
  const [game, setGame] = useState<GameState | null>(() => getLatestGame());
  const [countdown, setCountdown] = useState(GAME_START_COUNTDOWN_SECONDS);

  const isWaiting = !game || game.status === "waiting";

  useEffect(() => {
    socket.connect();

    const onGameSync = (nextGame: GameState) => {
      setGame(nextGame);
    };

    socket.on("game:sync", onGameSync);
    socket.on("game:started", onGameSync);

    return () => {
      socket.off("game:sync", onGameSync);
      socket.off("game:started", onGameSync);
    };
  }, []);

  useEffect(() => {
    if (!isWaiting) {
      return;
    }

    const interval = setInterval(() => {
      setCountdown((current) => Math.max(1, current - 1));
    }, 1_000);

    return () => clearInterval(interval);
  }, [isWaiting]);

  if (!game) {
    return (
      <main className={styles.page}>
        <h1 className={styles.pageTitle}>Game</h1>
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <p className="font-semibold text-zinc-200">
            Waiting for game to start…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>Game</h1>

      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <div>
            <p className={styles.playerName}>{user?.username}</p>
            <p className={styles.playerHealth}>HP: 80/100</p>
          </div>

          <div className={styles.controls}>
            <p>Move: WASD</p>
            <p>Attack: Space</p>
          </div>
        </aside>

        <div className={`${styles.boardArea} relative`}>
          <PixiGameBoard map={game.map} />

          {isWaiting && (
            <div className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-xl bg-black/60 px-6 py-3">
              <p className="font-semibold text-zinc-200">Game starts in…</p>
              <p className="text-5xl leading-none font-extrabold text-yellow-400">
                {countdown}
              </p>
            </div>
          )}
        </div>

        <aside className={`${styles.sidebar} ${styles.sidebarRight}`}>
          <div>
            {/* TODO: Fill in the actual timer */}
            <p className={styles.timer}>05:13</p>
            <p className={styles.playersRemaining}>
              Players: {game.players.length}
            </p>
          </div>

          <button className={styles.leaveButton} type="button">
            Leave game
          </button>
        </aside>
      </section>
    </main>
  );
}
