"use client";

const TILESET_PATH = "/assets/tiles/dungeon-crawl.png";

const TILE_SIZE = 32;

const COLUMNS = 60;

const ROWS = 40;

function createDebugTiles() {
  const tiles = [];

  for (let y = 0; y < ROWS; y++) {
    // x ist die Spalte im Tileset.
    for (let x = 0; x < COLUMNS; x++) {
      tiles.push({
        frameX: x * TILE_SIZE,
        frameY: y * TILE_SIZE,
      });
    }
  }

  return tiles;
}

export default function TilesDebugPage() {
  const tiles = createDebugTiles();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
      <h1 className="mb-2 text-3xl font-bold">Tiles Debug</h1>

      <p className="mb-4 text-zinc-400">
        Suche passende Tiles und kopiere danach die x/y-Werte in
        tileTextureFrames.ts.
      </p>

      <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <p className="mb-3 text-sm text-zinc-400">Path test: {TILESET_PATH}</p>

        <img
          src={TILESET_PATH}
          alt="Dungeon crawl tileset path test"
          className="max-h-40 max-w-full border border-zinc-700 object-contain"
        />
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10">
        {tiles.map((tile) => (
          <div
            className="flex flex-col items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3"
            key={`${tile.frameX}-${tile.frameY}`}
          >
            <div
              className="h-8 w-8 bg-no-repeat"
              style={{
                backgroundImage: `url(${TILESET_PATH})`,
                backgroundPosition: `-${tile.frameX}px -${tile.frameY}px`,
                backgroundSize: "auto",
                imageRendering: "pixelated",
              }}
            />

            <span className="text-xs text-zinc-400">
              x:{tile.frameX} y:{tile.frameY}
            </span>
          </div>
        ))}
      </section>
    </main>
  );
}
