import { ColorMatrixFilter, Container, type Sprite } from "pixi.js";
import type { GameMap } from "../../types/map";
import type { GamePlayer } from "../shared/types";
import type { BoardLayout } from "../../components/boardLayout";

type RenderFovOptions = {
  layer: Container;
  map: GameMap;
  players: GamePlayer[];
  localPlayerId: string | undefined;
  layout: BoardLayout;
  createTileSprite: (
    frameX: number,
    frameY: number,
    x: number,
    y: number,
    tileSize: number,
  ) => Sprite;
  isSpectating?: boolean;
};

const FOG_FRAME = {
  x: 768,
  y: 608,
};

const DEFAULT_VISION_RANGE = 3;

// Diese Funktion zeichnet den Sichtbereich des lokalen Spielers.
export function renderFov({
  layer,
  map,
  players,
  localPlayerId,
  layout,
  createTileSprite,
  isSpectating,
}: RenderFovOptions) {
  layer.removeChildren();

  const localPlayer = players.find((player) => player.id === localPlayerId);

  // Besiegte Spieler sehen die komplette Karte ohne Nebel.
  if (isSpectating || localPlayer?.status === "defeated") {
    return;
  }

  const { offsetX, offsetY, tileSize } = layout;

  const fogContainer = new Container();

  const playerX = localPlayer?.position.x ?? -999;
  const playerY = localPlayer?.position.y ?? -999;

  const visionRange = localPlayer?.visionRange ?? DEFAULT_VISION_RANGE;

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const distanceX = Math.abs(x - playerX);
      const distanceY = Math.abs(y - playerY);

      // Wir benutzen die größere Distanz, damit ein quadratischer Sichtbereich entsteht.
      const distance = Math.max(distanceX, distanceY);

      // Sichtbare Tiles brauchen keinen Nebel.
      if (localPlayer && distance <= visionRange - 1) {
        continue;
      }

      const fogSprite = createTileSprite(
        FOG_FRAME.x,
        FOG_FRAME.y,
        x * tileSize,
        y * tileSize,
        tileSize,
      );

      // Der Rand des Sichtbereichs ist transparenter und wirkt dadurch weicher.
      if (localPlayer && distance === visionRange) {
        fogSprite.alpha = 0.4;
      }

      fogContainer.addChild(fogSprite);
    }
  }

  // Dieser Filter entfernt die Farben aus dem verdeckten Kartenbereich.
  const colorMatrix = new ColorMatrixFilter();
  colorMatrix.desaturate();

  fogContainer.filters = [colorMatrix];
  fogContainer.tint = 0x222222;
  fogContainer.alpha = 0.9;

  fogContainer.x = offsetX;
  fogContainer.y = offsetY;

  layer.addChild(fogContainer);
}
