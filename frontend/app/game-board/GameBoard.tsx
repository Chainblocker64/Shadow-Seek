"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PixiGameBoard } from "../../features/game/components/PixiGameBoard";
import type { GameState } from "../../features/game/types/game";
import { socket } from "@/lib/socket";
import { getLatestGame } from "../../features/game/gameSync";
import PlayerList from "./PlayerList";
import styles from "./GameBoardPage.module.css";
import type { MovementResult } from "../../features/game/types/movement";

// Mirrors the backend's GAME_START_DELAY_MS (backend/src/game/consts.ts).
const GAME_START_COUNTDOWN_SECONDS = 3;

function formatRemainingTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export default function GameBoard() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(() => getLatestGame());
  const [countdown, setCountdown] = useState(GAME_START_COUNTDOWN_SECONDS);
  // Ticks once a second so the remaining-time display counts down.
  const [now, setNow] = useState(() => Date.now());

  const isWaiting = !game || game.status === "waiting";
  const isEnded = game?.status === "ended";
  const remainingMs =
    game?.endsAt != null ? Math.max(0, game.endsAt - now) : null;

  const labeledPlayers = useMemo(
    () =>
      (game?.players ?? []).map((player) => ({
        id: player.id,
        name: player.name,
        label: player.name,
        isSelf: player.id === socket.id,
        spriteIndex: player.spriteIndex,
        position: player.position,
        facingDirection: player.facingDirection,
      })),
    [game?.players],
  );

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.connect();

    const onGameSync = (game: GameState) => {
      setGame(game);
    };

    const onMovementConfirmed = (result: MovementResult) => {
      setGame((currentGame) => {
        if (!currentGame) {
          return currentGame;
        }

        const playerExists = currentGame.players.some(
          (player) => player.id === result.player.id,
        );

        if (!playerExists) {
          return currentGame;
        }

        return {
          ...currentGame,
          players: currentGame.players.map((player) =>
            player.id === result.player.id
              ? {
                  ...player,
                  position: {
                    ...result.player.position,
                  },
                  facingDirection: result.player.facingDirection,
                }
              : player,
          ),
        };
      });
    };

    const onGameLeft = () => {
      setGame(null);
      router.push("/lobby");
    };

    socket.on("game:sync", onGameSync);
    socket.on("movement:confirmed", onMovementConfirmed);
    socket.on("game:ended", onGameSync);
    socket.on("game:left", onGameLeft);

    return () => {
      socket.off("game:sync", onGameSync);
      socket.off("movement:confirmed", onMovementConfirmed);
      socket.off("game:ended", onGameSync);
      socket.off("game:left", onGameLeft);
    };
  }, [router]);

  const handleLeaveGame = () => {
    socket.emit("leaveGame");
  };

  useEffect(() => {
    if (!isWaiting) {
      return;
    }

    const interval = setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
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
            <p className={styles.gameLabel}>Shadow Seek</p>
            {/* TODO: Fill in the actual health once the game state carries it */}
            <p className={styles.playerHealth}>Health Points: 80/100</p>
          </div>

          <PlayerList players={labeledPlayers} />

          <div className={styles.controls}>
            <p>Move: WASD</p>
            <p>Attack: Space</p>
          </div>
        </aside>

        <div className={`${styles.boardArea} relative`}>
          <PixiGameBoard
            map={game.map}
            players={labeledPlayers}
            status={game.status}
          />

          {isWaiting && (
            <div className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-xl bg-black/60 px-6 py-3">
              <p className="font-semibold text-zinc-200">Game starts in…</p>
              <p className="text-5xl leading-none font-extrabold text-yellow-400">
                {countdown}
              </p>
            </div>
          )}

          {isEnded && (
            <div className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-xl bg-black/60 px-6 py-3">
              <p className="text-3xl leading-none font-extrabold text-red-400">
                Game over
              </p>
            </div>
          )}
        </div>

        <aside className={`${styles.sidebar} ${styles.sidebarRight}`}>
          <div>
            <p className={styles.timer}>
              {isEnded
                ? "00:00"
                : remainingMs !== null
                  ? formatRemainingTime(remainingMs)
                  : "--:--"}
            </p>
            <p className={styles.playersRemaining}>
              Players: {game.players.length}
            </p>
          </div>

          <button
            className={styles.leaveButton}
            type="button"
            onClick={handleLeaveGame}
          >
            Leave game
          </button>
        </aside>
      </section>
    </main>
  );
}
