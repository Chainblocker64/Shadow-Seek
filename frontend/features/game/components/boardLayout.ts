export type BoardLayout = {
  offsetX: number;
  offsetY: number;
  tileSize: number;
};

/**
 * Fits a rectangular map inside the square board without cropping it.
 * Keeping this calculation in one place makes every rendered layer use the
 * same fractional tile size and offsets when the board is resized.
 */
export function calculateBoardLayout(
  boardSize: number,
  mapWidth: number,
  mapHeight: number,
): BoardLayout {
  if (
    !Number.isFinite(boardSize) ||
    !Number.isFinite(mapWidth) ||
    !Number.isFinite(mapHeight) ||
    boardSize <= 0 ||
    mapWidth <= 0 ||
    mapHeight <= 0
  ) {
    return { offsetX: 0, offsetY: 0, tileSize: 0 };
  }

  const tileSize = Math.min(boardSize / mapWidth, boardSize / mapHeight);
  const mapPixelWidth = tileSize * mapWidth;
  const mapPixelHeight = tileSize * mapHeight;

  return {
    offsetX: (boardSize - mapPixelWidth) / 2,
    offsetY: (boardSize - mapPixelHeight) / 2,
    tileSize,
  };
}
