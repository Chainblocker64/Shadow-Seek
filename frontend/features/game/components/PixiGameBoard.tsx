"use client";

import { Application, Assets, Rectangle, Sprite, Texture } from "pixi.js";
import { useEffect, useRef } from "react";
import type { GameMap } from "../types/map";
import {
  TILE_TEXTURE_SIZE,
  tileTextureFrames,
} from "../data/tileTextureFrames";

type PixiGameBoardProps = {
  map: GameMap;
};

const TILESET_PATH = "/assets/tiles/dungeon-crawl.png";

export function PixiGameBoard({ map }: PixiGameBoardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let isDestroyed = false;
    let app: Application | null = null;

    async function setupPixi() {
      app = new Application();

      await app.init({
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });

      if (isDestroyed || !container || !app) {
        app?.destroy(true);
        return;
      }

      container.innerHTML = "";
      container.appendChild(app.canvas);

      const tilesetTexture = await Assets.load<Texture>(TILESET_PATH);

      if (isDestroyed || !app) {
        return;
      }

      function createTileTexture(frameX: number, frameY: number) {
        return new Texture({
          source: tilesetTexture.source,

          frame: new Rectangle(
            frameX,
            frameY,
            TILE_TEXTURE_SIZE,
            TILE_TEXTURE_SIZE,
          ),
        });
      }

      function renderMap() {
        if (!app || !container) {
          return;
        }

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const boardSize = Math.min(containerWidth, containerHeight);

        app.renderer.resize(boardSize, boardSize);

        app.stage.removeChildren();

        const tileSize = Math.floor(
          Math.min(boardSize / map.width, boardSize / map.height),
        );

        const mapWidth = tileSize * map.width;
        const mapHeight = tileSize * map.height;
        const offsetX = Math.floor((boardSize - mapWidth) / 2);
        const offsetY = Math.floor((boardSize - mapHeight) / 2);

        map.tiles.forEach((row, y) => {
          row.forEach((tileType, x) => {
            const frame = tileTextureFrames[tileType];

            const tileTexture = createTileTexture(frame.x, frame.y);

            const tileSprite = new Sprite(tileTexture);

            tileSprite.x = offsetX + x * tileSize;
            tileSprite.y = offsetY + y * tileSize;

            tileSprite.width = tileSize;
            tileSprite.height = tileSize;

            app?.stage.addChild(tileSprite);
          });
        });
      }

      renderMap();

      const resizeObserver = new ResizeObserver(() => {
        renderMap();
      });

      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
      };
    }

    let cleanupResizeObserver: (() => void) | undefined;

    setupPixi().then((cleanup) => {
      cleanupResizeObserver = cleanup;
    });

    return () => {
      isDestroyed = true;
      cleanupResizeObserver?.();
      app?.destroy(true);
    };
  }, [map]);

  return <div className="pixi-board-container" ref={containerRef} />;
}
