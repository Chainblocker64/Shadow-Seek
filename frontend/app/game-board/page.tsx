import { PixiGameBoard } from "../../features/game/components/PixiGameBoard";
import { exampleMap } from "../../features/game/data/exampleMap";
import styles from "./GameBoardPage.module.css";

export default function GameBoardPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>Game</h1>

      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <div>
            <p className={styles.playerName}>Player 2</p>
            <p className={styles.playerHealth}>HP: 80/100</p>
          </div>

          <div className={styles.controls}>
            <p>Move: WASD</p>
            <p>Attack: Space</p>
          </div>
        </aside>

        <div className={styles.boardArea}>
          <PixiGameBoard map={exampleMap} />
        </div>

        <aside className={`${styles.sidebar} ${styles.sidebarRight}`}>
          <div>
            <p className={styles.timer}>05:13</p>
            <p className={styles.playersRemaining}>Players remaining: 2</p>
          </div>

          <button className={styles.leaveButton} type="button">
            Leave game
          </button>
        </aside>
      </section>
    </main>
  );
}
