"use client";

import styles from "./PixiGameBoard.module.css";
import {
  Application,
  Assets,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Text,
  Texture,
} from "pixi.js";
import { useEffect, useRef } from "react";
import type { GameMap } from "../types/map";
import type { GameState } from "../types/game";
import type {
  Player,
  PlayerDirection,
  PlayerPosition,
} from "../types/player";
import {
  baseTileTextureFrames,
  mapObjectTextureFrames,
  playerTextureFrames,
  TILE_TEXTURE_SIZE,
} from "../data/tileTextureFrames";
import { useInputControls } from "../hooks/useInputControls";
import { calculateBoardLayout, type BoardLayout } from "./boardLayout";

type GamePlayer = Player & {
  label: string;
};

type PixiGameBoardProps = {
  map: GameMap;
  players: GamePlayer[];
  status: GameState["status"];
  currentPlayerSpawnPosition: PlayerPosition | null;
};

const TILESET_PATH = "/assets/tiles/dungeon-crawl.png";

const DIRECTION_SPRITE_SIZE = 48;
const directionTexturePaths: Record<PlayerDirection, string> = {
  up: "/assets/direction/up.png",
  down: "/assets/direction/down.png",
  left: "/assets/direction/left.png",
  right: "/assets/direction/right.png",
};

export function PixiGameBoard({
  map,
  players,
  status,
  currentPlayerSpawnPosition,
}: PixiGameBoardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playersRef = useRef(players);
  const renderPlayersRef = useRef<(() => void) | null>(null);
  const spawnHighlightRef = useRef(currentPlayerSpawnPosition);
  const renderSpawnHighlightRef = useRef<(() => void) | null>(null);

  useInputControls(status === "running");

  useEffect(() => {
    spawnHighlightRef.current = currentPlayerSpawnPosition;
    renderSpawnHighlightRef.current?.();
  }, [currentPlayerSpawnPosition]);

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
      renderPlayersRef.current = null;
      renderSpawnHighlightRef.current = null;
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

      const directionTextures = {
        up: await Assets.load<Texture>(directionTexturePaths.up),
        down: await Assets.load<Texture>(directionTexturePaths.down),
        left: await Assets.load<Texture>(directionTexturePaths.left),
        right: await Assets.load<Texture>(directionTexturePaths.right),
      };

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

      const playerLayer = new Container();
      const spawnHighlightLayer = new Container();
      let layout: BoardLayout | null = null;

      // Marks where this client's own character will start while the game is
      // still waiting. Uses a border plus a "You" caption so it never relies on
      // colour alone and can't be mistaken for an active player.
      function renderSpawnHighlight() {
        if (!layout) {
          return;
        }

        const { offsetX, offsetY, tileSize } = layout;

        spawnHighlightLayer.removeChildren();

        const spawn = spawnHighlightRef.current;

        if (!spawn) {
          return;
        }

        const x = offsetX + spawn.x * tileSize;
        const y = offsetY + spawn.y * tileSize;

        // The dark outer stroke keeps the marker readable on every tile type.
        const border = new Graphics()
          .rect(x + 1, y + 1, tileSize - 2, tileSize - 2)
          .stroke({ width: 4, color: 0x000000, alpha: 0.7 })
          .rect(x + 1, y + 1, tileSize - 2, tileSize - 2)
          .stroke({ width: 2, color: 0xfacc15 });

        const caption = new Text({
          text: "You",
          style: {
            fontSize: Math.max(10, Math.round(tileSize * 0.45)),
            fontWeight: "bold",
            fill: 0xfacc15,
            stroke: { color: 0x000000, width: 3 },
          },
        });

        // Caption sits below the tile, except on the last row where it would be
        // clipped by the canvas edge.
        const isLastRow = spawn.y === map.height - 1;

        caption.anchor.set(0.5, isLastRow ? 1 : 0);
        caption.x = x + tileSize / 2;
        caption.y = isLastRow ? y - 2 : y + tileSize + 2;

        spawnHighlightLayer.addChild(border, caption);
      }

      renderSpawnHighlightRef.current = renderSpawnHighlight;

      function renderPlayers() {
        if (!layout) {
          return;
        }

        const { offsetX, offsetY, tileSize } = layout;

        playerLayer.removeChildren();

        playersRef.current.forEach((player) => {
          const frame =
            playerTextureFrames[
              player.spriteIndex % playerTextureFrames.length
            ];

          playerLayer.addChild(
            createTileSprite(
              frame.x,
              frame.y,
              offsetX + player.position.x * tileSize,
              offsetY + player.position.y * tileSize,
              tileSize,
            ),
          );
          const directionSpriteSize = Math.min(DIRECTION_SPRITE_SIZE, tileSize);
          const directionSprite = new Sprite(
            directionTextures[player.facingDirection],
          );

          directionSprite.x =
            offsetX +
            player.position.x * tileSize +
            (tileSize - directionSpriteSize) / 2;

          directionSprite.y =
            offsetY +
            player.position.y * tileSize +
            (tileSize - directionSpriteSize) / 2;

          directionSprite.width = directionSpriteSize;
          directionSprite.height = directionSpriteSize;

          playerLayer.addChild(directionSprite);

          const playerLabel = new Text({
            text: player.label,
            style: {
              fontSize: 12,
              fontWeight: "bold",
              fill: 0xffffff,
              stroke: { color: 0x000000, width: 2 },
            },
          });

          playerLabel.anchor.set(0.5, 1);
          playerLabel.alpha = 0.5;
          playerLabel.x = offsetX + (player.position.x + 0.5) * tileSize;
          playerLabel.y = offsetY + player.position.y * tileSize;
          playerLayer.addChild(playerLabel);
        });
      }

      renderPlayersRef.current = renderPlayers;

      function renderMap() {
        if (!app || !container) {
          return;
        }

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const boardSize = Math.min(containerWidth, containerHeight);

        if (boardSize <= 0 || map.width <= 0 || map.height <= 0) {
          return;
        }

        app.renderer.resize(boardSize, boardSize);
        app.stage.removeChildren();

        const { offsetX, offsetY, tileSize } = calculateBoardLayout(
          boardSize,
          map.width,
          map.height,
        );

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

        app.stage.addChild(playerLayer);
        app.stage.addChild(spawnHighlightLayer);
        layout = { offsetX, offsetY, tileSize };
        renderPlayers();
        renderSpawnHighlight();
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
  }, [map]);

  useEffect(() => {
    playersRef.current = players;
    renderPlayersRef.current?.();
  }, [players]);

  return <div className={styles.canvasHost} ref={containerRef} />;
}
