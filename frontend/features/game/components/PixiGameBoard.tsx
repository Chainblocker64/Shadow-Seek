"use client";

import styles from "./PixiGameBoard.module.css";
import { Application, Assets, Rectangle, Sprite, Texture } from "pixi.js";
import { useEffect, useRef } from "react";
import type { GameMap } from "../types/map";
import {
  baseTileTextureFrames,
  mapObjectTextureFrames,
  TILE_TEXTURE_SIZE,
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

      function createTileSprite(
        frameX: number,
        frameY: number,
        x: number,
        y: number,
        tileSize: number,
      ) {
        const texture = createTileTexture(frameX, frameY);
        const sprite = new Sprite(texture);

        sprite.x = x;
        sprite.y = y;
        sprite.width = tileSize;
        sprite.height = tileSize;

        return sprite;
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

        map.objects.forEach((object) => {
          const objectFrame = mapObjectTextureFrames[object.type];

          const objectX = offsetX + object.x * tileSize;
          const objectY = offsetY + object.y * tileSize;

          const objectSprite = createTileSprite(
            objectFrame.x,
            objectFrame.y,
            objectX,
            objectY,
            tileSize,
          );

          app.stage.addChild(objectSprite);
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

  return <div className={styles.container} ref={containerRef} />;
}
