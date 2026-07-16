import { exampleMap } from "../../features/game/data/exampleMap";
import { GameBoard } from "../../features/game/components/GameBoard";

export default function GameBoardPage() {
  return (
    <main className="game-board-page">
      <GameBoard map={exampleMap} />
    </main>
  );
}
