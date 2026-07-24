"use client";

import { useEffect, useState } from "react";
import { PixiGameBoard } from "../../features/game/components/PixiGameBoard";
import type { GameState } from "../../features/game/types/game";
import { socket } from "@/lib/socket";
import styles from "./GameBoardPage.module.css";

export default function GameBoard() {
  const [game, setGame] = useState<GameState | null>(null);

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

  if (!game) {
    return (
      <main className={styles.page}>
        <h1 className={styles.pageTitle}>Game</h1>
        <p>Waiting for game data…</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>Game</h1>

      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <div>
            {/* TODO: Use authenticated user name for the player name */}
            <p className={styles.playerName}>{game.players[0]?.id}</p>
            <p className={styles.playerHealth}>HP: 80/100</p>
          </div>

          <div className={styles.controls}>
            <p>Move: WASD</p>
            <p>Attack: Space</p>
          </div>
        </aside>

        <div className={styles.boardArea}>
          <PixiGameBoard map={game.map} />
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
