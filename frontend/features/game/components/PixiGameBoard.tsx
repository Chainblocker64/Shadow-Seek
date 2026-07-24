"use client";

import styles from "./PixiGameBoard.module.css";
import { Application, Assets, Rectangle, Sprite, Texture } from "pixi.js";
import { useEffect, useRef } from "react";
import type { GameMap } from "../types/map";
import type { PlayerPosition } from "../types/player";
import {
  baseTileTextureFrames,
  mapObjectTextureFrames,
  playerTextureFrames,
  TILE_TEXTURE_SIZE,
} from "../data/tileTextureFrames";
import { useMovementControls } from "../hooks/useMovementControls";

type GamePlayer = {
  id: string;
  position: PlayerPosition;
  label: string;
};

type PixiGameBoardProps = {
  map: GameMap;
  players: GamePlayer[];
};

const TILESET_PATH = "/assets/tiles/dungeon-crawl.png";

export function PixiGameBoard({ map, players }: PixiGameBoardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useMovementControls();

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let isDestroyed = false;
    let app: Application | null = null;

    // Application.destroy() throws before app.init() resolves (its plugins,
    // e.g. resize handling, aren't set up yet), so only ever destroy an app
    // whose init() has already completed.
    function destroyApp() {
      app?.destroy(true);
      app = null;
    }

    async function setupPixi() {
      app = new Application();

      await app.init({
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });

      if (isDestroyed || !container) {
        destroyApp();
        return;
      }

      container.innerHTML = "";
      container.appendChild(app.canvas);

      const tilesetTexture = await Assets.load<Texture>(TILESET_PATH);

      if (isDestroyed || !app) {
        destroyApp();
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

          app?.stage.addChild(overrideSprite);
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

          app?.stage.addChild(objectSprite);
        });

        players.forEach((player, index) => {
          const frame = playerTextureFrames[index % playerTextureFrames.length];

          const playerX = offsetX + player.position.x * tileSize;
          const playerY = offsetY + player.position.y * tileSize;

          const playerSprite = createTileSprite(
            frame.x,
            frame.y,
            playerX,
            playerY,
            tileSize,
          );

          app?.stage.addChild(playerSprite);
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

    const setupDone = setupPixi().then((cleanup) => {
      cleanupResizeObserver = cleanup;
    });

    return () => {
      isDestroyed = true;
      // Wait for setupPixi's in-flight init/asset loading to settle before
      // destroying, since app.init() must resolve before destroy() is safe.
      setupDone.then(() => {
        cleanupResizeObserver?.();
        destroyApp();
      });
    };
  }, [map, players]);

  return (
    <div className={styles.container}>
      <div className={styles.canvasHost} ref={containerRef} />
      {players.map((player) => (
        <span
          key={player.id}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full text-xs font-bold whitespace-nowrap text-white opacity-50 drop-shadow-[0_1px_1px_black]"
          style={{
            left: `${((player.position.x + 0.5) / map.width) * 100}%`,
            top: `${(player.position.y / map.height) * 100}%`,
          }}
        >
          {player.label}
        </span>
      ))}
    </div>
  );
}
