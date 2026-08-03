import { Container, Graphics, Text } from "pixi.js";
import type { BoardLayout } from "./boardLayout";
import type { PlayerPosition } from "../types/player";

const HIGHLIGHT_COLOR = 0xfacc15;
const CAPTION_MIN_FONT_SIZE = 10;
const CAPTION_FONT_SIZE_RATIO = 0.45;
const CAPTION_GAP = 2;

type TileHighlightOptions = {
  position: PlayerPosition;
  caption: string;
  layout: BoardLayout;
  mapHeight: number;
};

export function createTileHighlight({
  position,
  caption,
  layout,
  mapHeight,
}: TileHighlightOptions): Container {
  const { offsetX, offsetY, tileSize } = layout;

  const x = offsetX + position.x * tileSize;
  const y = offsetY + position.y * tileSize;

  // The dark outer stroke keeps the marker readable on every tile type.
  const border = new Graphics()
    .rect(x + 1, y + 1, tileSize - 2, tileSize - 2)
    .stroke({ width: 4, color: 0x000000, alpha: 0.7 })
    .rect(x + 1, y + 1, tileSize - 2, tileSize - 2)
    .stroke({ width: 2, color: HIGHLIGHT_COLOR });

  const captionText = new Text({
    text: caption,
    style: {
      fontSize: Math.max(
        CAPTION_MIN_FONT_SIZE,
        Math.round(tileSize * CAPTION_FONT_SIZE_RATIO),
      ),
      fontWeight: "bold",
      fill: HIGHLIGHT_COLOR,
      stroke: { color: 0x000000, width: 3 },
    },
  });

  // Caption sits below the tile, except on the last row where it would be
  // clipped by the canvas edge.
  const isLastRow = position.y === mapHeight - 1;

  captionText.anchor.set(0.5, isLastRow ? 1 : 0);
  captionText.x = x + tileSize / 2;
  captionText.y = isLastRow ? y - CAPTION_GAP : y + tileSize + CAPTION_GAP;

  const highlight = new Container();

  highlight.addChild(border, captionText);

  return highlight;
}
