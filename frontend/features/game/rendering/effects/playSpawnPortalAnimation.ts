import type { Container } from "pixi.js";
import type { PlayerPosition } from "../../types/player";
import type { BoardLayout } from "../../components/boardLayout";
import type { createAnimationManager } from "../../animations/createAnimationManager";

type AnimationManager = ReturnType<typeof createAnimationManager>;

type PlaySpawnPortalAnimationOptions = {
  layer: Container;
  spawnPosition: PlayerPosition | null;
  layout: BoardLayout;
  animationManager: AnimationManager;
  hasPlayed: boolean;
};

export function playSpawnPortalAnimation({
  layer,
  spawnPosition,
  layout,
  animationManager,
  hasPlayed,
}: PlaySpawnPortalAnimationOptions): boolean {
  // Ohne Spawn-Position oder nach bereits abgespielter Animation passiert nichts.
  if (!spawnPosition || hasPlayed) {
    return hasPlayed;
  }

  const { offsetX, offsetY, tileSize } = layout;

  const portalX = offsetX + spawnPosition.x * tileSize;
  const portalY = offsetY + spawnPosition.y * tileSize;

  // Zuerst wird die Öffnungsanimation erstellt.
  const portalOpen = animationManager.create("portalOpen", {
    x: portalX,
    y: portalY,
    width: tileSize,
    height: tileSize,
    autoPlay: false,
  });

  portalOpen.onComplete = () => {
    layer.removeChild(portalOpen);
    portalOpen.destroy();

    // Nach dem Öffnen startet direkt die Schließanimation.
    const portalClose = animationManager.create("portalClose", {
      x: portalX,
      y: portalY,
      width: tileSize,
      height: tileSize,
      autoPlay: false,
    });

    portalClose.onComplete = () => {
      layer.removeChild(portalClose);
      portalClose.destroy();
    };

    layer.addChild(portalClose);
    portalClose.play();
  };

  layer.addChild(portalOpen);
  portalOpen.play();

  // Der Rückgabewert merkt sich, dass die Animation bereits gestartet wurde.
  return true;
}
