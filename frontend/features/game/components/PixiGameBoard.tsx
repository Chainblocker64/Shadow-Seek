"use client";

import styles from "./PixiGameBoard.module.css";
import {
  Application,
  Assets,
  Container,
  Rectangle,
  Sprite,
  Text,
  Texture,
} from "pixi.js";
import { useEffect, useRef } from "react";
import type { GameMap } from "../types/map";
import type { GameState } from "../types/game";
import type { Player, PlayerDirection } from "../types/player";
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
};

const TILESET_PATH = "/assets/tiles/dungeon-crawl.png";

const DIRECTION_SPRITE_SIZE = 48;
const directionTexturePaths: Record<PlayerDirection, string> = {
  up: "/assets/direction/up.png",
  down: "/assets/direction/down.png",
  left: "/assets/direction/left.png",
  right: "/assets/direction/right.png",
};

export function PixiGameBoard({ map, players, status }: PixiGameBoardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playersRef = useRef(players);
  const mapRef = useRef(map);
  const renderPlayersRef = useRef<(() => void) | null>(null);
  const renderMapRef = useRef<(() => void) | null>(null);

  useInputControls(status === "running");

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
      renderMapRef.current = null;
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
      let layout: BoardLayout | null = null;

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

        const map = mapRef.current;
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
        layout = { offsetX, offsetY, tileSize };
        renderPlayers();
      }

      renderMapRef.current = renderMap;
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
  }, []);

  useEffect(() => {
    mapRef.current = map;
    renderMapRef.current?.();
  }, [map]);

  useEffect(() => {
    playersRef.current = players;
    renderPlayersRef.current?.();
  }, [players]);

  return <div className={styles.canvasHost} ref={containerRef} />;
}
