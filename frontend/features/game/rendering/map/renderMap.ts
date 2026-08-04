import type { Application, Container } from "pixi.js";
import {
  baseTileTextureFrames,
  mapObjectTextureFrames,
} from "../../data/tileTextureFrames";
import type { createAnimationManager } from "../../animations/createAnimationManager";
import type { GameMap } from "../../types/map";
import type { BoardLayout } from "../../components/boardLayout";
import type { TileFactory } from "../shared/tileFactory";

type AnimationManager = ReturnType<typeof createAnimationManager>;

type PixiBoardLayers = {
  directionLayer: Container;
  playerLayer: Container;
  swimmingOverlayLayer: Container;
  attackPreviewLayer: Container;
  attackAnimationLayer: Container;
  attackCooldownLayer: Container;
  portalLayer: Container;
  spawnHighlightLayer: Container;
  fovLayer: Container;
  winnerHighlightLayer: Container;
};

type RenderMapOptions = {
  app: Application;
  container: HTMLDivElement;
  map: GameMap;
  animationManager: AnimationManager;
  createTileSprite: TileFactory["createTileSprite"];
  calculateLayout: (
    boardSize: number,
    mapWidth: number,
    mapHeight: number,
  ) => BoardLayout;
  layers: PixiBoardLayers;
};

// Diese Funktion zeichnet die vollständige Karte und gibt das neue Board-Layout zurück.
export function renderMap({
  app,
  container,
  map,
  animationManager,
  createTileSprite,
  calculateLayout,
  layers,
}: RenderMapOptions): BoardLayout | null {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const boardSize = Math.min(containerWidth, containerHeight);

  if (boardSize <= 0 || map.width <= 0 || map.height <= 0) {
    return null;
  }

  app.renderer.resize(boardSize, boardSize);
  app.stage.removeChildren();

  const layout = calculateLayout(boardSize, map.width, map.height);
  const { offsetX, offsetY, tileSize } = layout;

  const baseFrame = baseTileTextureFrames[map.baseTile];

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tileX = offsetX + x * tileSize;
      const tileY = offsetY + y * tileSize;

      const baseSprite = createTileSprite(
        baseFrame.x,
        baseFrame.y,
        tileX,
        tileY,
        tileSize,
      );

      app.stage.addChild(baseSprite);
    }
  }

  // Diese Tiles überschreiben an bestimmten Positionen den normalen Boden.
  map.baseOverrides.forEach((baseOverride) => {
    const overrideFrame = baseTileTextureFrames[baseOverride.type];

    const overrideX = offsetX + baseOverride.x * tileSize;
    const overrideY = offsetY + baseOverride.y * tileSize;

    const overrideSprite = createTileSprite(
      overrideFrame.x,
      overrideFrame.y,
      overrideX,
      overrideY,
      tileSize,
    );

    app.stage.addChild(overrideSprite);
  });

  // Hier zeichnen wir statische und animierte Kartenobjekte.
  map.objects.forEach((object) => {
    const objectX = offsetX + object.x * tileSize;
    const objectY = offsetY + object.y * tileSize;

    if (object.type === "water") {
      const animatedWater = animationManager.create("water", {
        x: objectX,
        y: objectY,
        width: tileSize,
        height: tileSize,
      });

      app.stage.addChild(animatedWater);
      return;
    }

    const objectFrame = mapObjectTextureFrames[object.type];

    const objectSprite = createTileSprite(
      objectFrame.x,
      objectFrame.y,
      objectX,
      objectY,
      tileSize,
    );

    app.stage.addChild(objectSprite);
  });

  // Die Reihenfolge bestimmt, welche Ebenen über anderen Ebenen liegen.
  app.stage.addChild(layers.directionLayer);
  app.stage.addChild(layers.playerLayer);
  app.stage.addChild(layers.swimmingOverlayLayer);
  app.stage.addChild(layers.attackPreviewLayer);
  app.stage.addChild(layers.attackAnimationLayer);
  app.stage.addChild(layers.attackCooldownLayer);
  app.stage.addChild(layers.portalLayer);
  app.stage.addChild(layers.spawnHighlightLayer);
  app.stage.addChild(layers.fovLayer);
  app.stage.addChild(layers.winnerHighlightLayer);

  return layout;
}
