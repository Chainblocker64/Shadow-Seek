import { PixiGameBoard } from "../../features/game/components/PixiGameBoard";
import { exampleMap } from "../../features/game/data/exampleMap";

export default function GameBoardPage() {
  return (
    <main className="game-page">
      <h1 className="game-page-title">Game</h1>

      <section className="game-layout">
        <aside className="game-sidebar game-sidebar-left">
          <div>
            <p className="game-player-name">Player 2</p>
            <p className="game-player-health">HP: 80/100</p>
          </div>

          <div className="game-controls">
            <p>Move: WASD</p>
            <p>Attack: Space</p>
          </div>
        </aside>

        <div className="game-board-area">
          <PixiGameBoard map={exampleMap} />
        </div>

        <aside className="game-sidebar game-sidebar-right">
          <div>
            <p className="game-timer">05:13</p>
            <p className="game-players-remaining">Players remaining: 2</p>
          </div>

          <button className="game-leave-button" type="button">
            Leave game
          </button>
        </aside>
      </section>
    </main>
  );
}
