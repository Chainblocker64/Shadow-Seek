"use client";

import { Application, Graphics } from "pixi.js";
import { useEffect, useRef } from "react";
import type { GameMap, TileType } from "../types/map";

type PixiGameBoardProps = {
  map: GameMap;
};

const tileColors: Record<TileType, number> = {
  floor: 0x3f3f46,
  wall: 0x09090b,
  tree: 0x064e3b,
  rock: 0x57534e,
  spawn: 0xeab308,
};

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
            const tile = new Graphics();

            tile
              .rect(
                offsetX + x * tileSize,
                offsetY + y * tileSize,
                tileSize,
                tileSize,
              )
              .fill(tileColors[tileType]);

            app?.stage.addChild(tile);
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
