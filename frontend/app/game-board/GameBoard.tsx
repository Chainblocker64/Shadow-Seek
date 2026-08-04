"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PixiGameBoard } from "../../features/game/components/PixiGameBoard";
import type { GameState } from "../../features/game/types/game";
import type { GameMap } from "../../features/game/types/map";
import { socket } from "@/lib/socket";
import {
  getLatestGame,
  getLatestGameIsSpectator,
} from "../../features/game/gameSync";
import PlayerList from "./PlayerList";
import styles from "./GameBoardPage.module.css";

// Mirrors the backend's GAME_START_DELAY_MS (backend/src/game/consts.ts).
const GAME_START_COUNTDOWN_SECONDS = 5;

// The map is static for the lifetime of a game, but every socket payload
// re-serializes it, giving it a new reference on every sync tick. Comparing
// contents lets us keep the old reference so PixiGameBoard only redraws the
// map when it actually changes.
function areMapsEqual(a: GameMap, b: GameMap): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

function formatRemainingTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export default function GameBoard() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(() => getLatestGame());
  const [isSpectating, setIsSpectating] = useState(() =>
    getLatestGameIsSpectator(),
  );
  const [countdown, setCountdown] = useState(GAME_START_COUNTDOWN_SECONDS);
  // Ticks once a second so the remaining-time display counts down.
  const [now, setNow] = useState(() => Date.now());
  const previousMapRef = useRef<GameMap | null>(game?.map ?? null);

  const isWaiting = !game || game.status === "waiting";
  const isEnded = game?.status === "ended";
  const remainingMs =
    game?.endsAt != null ? Math.max(0, game.endsAt - now) : null;
  const currentPlayer =
    game?.players.find((player) => player.id === socket.id) ?? null;
  const currentPlayerSpawnPosition = currentPlayer?.position ?? null;
  // The winner's name is frozen server-side at game end, so it stays correct
  // even after the winner disconnects and drops out of `game.players`.
  const winnerName = isEnded ? game.winnerName : null;
  const winner =
    isEnded && game.winner
      ? (game.players.find((player) => player.id === game.winner) ?? null)
      : null;

  const publicPlayers = game?.publicGameInformation?.players;

  const labeledPlayers = useMemo(
    () =>
      (game?.players ?? []).map((player) => ({
        ...player,
        label: player.name,
        isSelf: player.id === socket.id,
      })),
    [game?.players],
  );

  // The board only renders players the field of view exposes, while the
  // sidebar lists everyone in the room.
  const listedPlayers = useMemo(
    () =>
      (publicPlayers ?? []).map((player) => ({
        ...player,
        isSelf: player.id === socket.id,
      })),
    [publicPlayers],
  );

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.connect();

    const updateGame = (game: GameState) => {
      const previousMap = previousMapRef.current;
      const map =
        previousMap && areMapsEqual(previousMap, game.map)
          ? previousMap
          : game.map;

      previousMapRef.current = map;
      setGame({ ...game, map });
    };

    const onGameSync = (game: GameState) => {
      updateGame(game);
      setIsSpectating(false);
    };

    const onSpectatorGameSync = (game: GameState) => {
      updateGame(game);
      setIsSpectating(true);
    };

    const onGameEnded = (game: GameState) => updateGame(game);

    const onGameLeft = () => {
      previousMapRef.current = null;
      setGame(null);
      setIsSpectating(false);
      router.push("/lobby");
    };

    socket.on("game:sync", onGameSync);
    socket.on("game:spectator:sync", onSpectatorGameSync);
    socket.on("game:ended", onGameEnded);
    socket.on("game:left", onGameLeft);
    // The game-open event triggers navigation from the lobby. Ask the server
    // for the current snapshot after this page has installed its listeners so
    // a sync emitted during that route transition cannot leave us waiting.
    socket.emit("requestGameState");

    return () => {
      socket.off("game:sync", onGameSync);
      socket.off("game:spectator:sync", onSpectatorGameSync);
      socket.off("game:ended", onGameEnded);
      socket.off("game:left", onGameLeft);
    };
  }, [router]);

  const handleLeaveGame = () => {
    socket.emit(isSpectating ? "leaveSpectatorGame" : "leaveGame", {
      roomId: game?.roomId,
    });
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
          </div>

          <PlayerList players={listedPlayers} />

          <div className={styles.controls}>
            {isSpectating ? (
              <p>Observing game</p>
            ) : (
              <>
                <p>Move: WASD</p>
                <p>Attack: Space</p>
              </>
            )}
          </div>
        </aside>

        <div className={`${styles.boardArea} relative`}>
          <PixiGameBoard
            map={game.map}
            players={labeledPlayers}
            currentPlayerSpawnPosition={
              isWaiting ? currentPlayerSpawnPosition : null
            }
            winnerPosition={winner?.position ?? null}
            status={game.status}
            isSpectating={isSpectating}
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
              <p className="font-semibold text-zinc-200">
                {winnerName ? `${winnerName} wins` : "Draw"}
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
              Players: {listedPlayers.length}
            </p>
          </div>

          <button
            className={styles.leaveButton}
            type="button"
            onClick={handleLeaveGame}
          >
            {isSpectating ? "Stop observing" : "Leave game"}
          </button>
        </aside>
      </section>
    </main>
  );
}
