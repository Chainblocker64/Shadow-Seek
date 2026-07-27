import AuthGuard from "../components/AuthGuard";
import GameBoard from "./GameBoard";

export default function GameBoardPage() {
  return (
    <AuthGuard>
      <GameBoard />
    </AuthGuard>
  );
}
