import type { GameMap, TileType } from "../types/map";

type GameBoardProps = {
  map: GameMap;
};

const tileLabels: Record<TileType, string> = {
  floor: "",
  wall: "W",
  tree: "T",
  rock: "R",
  spawn: "S",
};

export function GameBoard({ map }: GameBoardProps) {
  return (
    <section className="game-board-wrapper">
      <h2 className="game-board-title">{map.name}</h2>

      <div
        className="game-board"
        style={{
          gridTemplateColumns: `repeat(${map.width}, minmax(0, 1fr))`,
        }}
      >
        {map.tiles.map((row, y) =>
          row.map((tileType, x) => (
            <div
              className={`game-tile game-tile-${tileType}`}
              key={`${x}-${y}`}
              title={`x: ${x}, y: ${y}, type: ${tileType}`}
            >
              {tileLabels[tileType]}
            </div>
          )),
        )}
      </div>
    </section>
  );
}
