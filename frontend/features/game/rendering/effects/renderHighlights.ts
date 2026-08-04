import type { Container } from "pixi.js";
import type { PlayerPosition } from "../../types/player";
import type { BoardLayout } from "../../components/boardLayout";
import { createTileHighlight } from "../../components/tileHighlight";

type RenderHighlightOptions = {
  layer: Container;
  position: PlayerPosition | null;
  caption: string;
  layout: BoardLayout;
  mapHeight: number;
};

function renderHighlight({
  layer,
  position,
  caption,
  layout,
  mapHeight,
}: RenderHighlightOptions) {
  layer.removeChildren();

  if (!position) {
    return;
  }

  layer.addChild(
    createTileHighlight({
      position,
      caption,
      layout,
      mapHeight,
    }),
  );
}

type RenderSpawnHighlightOptions = Omit<RenderHighlightOptions, "caption">;

export function renderSpawnHighlight(options: RenderSpawnHighlightOptions) {
  renderHighlight({
    ...options,
    caption: "You",
  });
}

type RenderWinnerHighlightOptions = Omit<RenderHighlightOptions, "caption">;

export function renderWinnerHighlight(options: RenderWinnerHighlightOptions) {
  renderHighlight({
    ...options,
    caption: "Winner",
  });
}
