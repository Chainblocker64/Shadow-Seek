import type { Container } from "pixi.js";
import type { createAnimationManager } from "../../animations/createAnimationManager";
import type { BoardLayout } from "../../components/boardLayout";
import type { MapObject } from "../../types/map";

type RenderSwimmingEffectOptions = {
  layer: Container;
  cover: MapObject | null;
  layout: BoardLayout;
  animationManager: ReturnType<typeof createAnimationManager>;
};

export function renderSwimmingEffect({
  layer,
  cover,
  layout,
  animationManager,
}: RenderSwimmingEffectOptions) {
  if (cover?.type !== "water") {
    return;
  }

  const { offsetX, offsetY, tileSize } = layout;
  const waterOverlay = animationManager.create("water", {
    x: offsetX + cover.x * tileSize,
    y: offsetY + (cover.y + 0.5) * tileSize,
    width: tileSize,
    height: tileSize / 2,
  });

  waterOverlay.alpha = 0.6;
  layer.addChild(waterOverlay);
}
