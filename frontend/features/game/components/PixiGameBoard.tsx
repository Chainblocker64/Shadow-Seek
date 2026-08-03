"use client";

import styles from "./PixiGameBoard.module.css";
import {
  Application,
  Assets,
  ColorMatrixFilter,
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
import type { Player, PlayerDirection, PlayerPosition } from "../types/player";
import {
  baseTileTextureFrames,
  mapObjectTextureFrames,
  playerTextureFrames,
  TILE_TEXTURE_SIZE,
} from "../data/tileTextureFrames";
import { socket } from "@/lib/socket";
import { useInputControls } from "../hooks/useInputControls";
import { calculateBoardLayout, type BoardLayout } from "./boardLayout";
import { createTileHighlight } from "./tileHighlight";
import { createAnimationManager } from "../animations/createAnimationManager";

type GamePlayer = Player & {
  label: string;
};

type AttackEvent = {
  attackerId: string;
  targetId: string | null;
  targetPosition: PlayerPosition;
};

type PixiGameBoardProps = {
  map: GameMap;
  players: GamePlayer[];
  status: GameState["status"];
  currentPlayerSpawnPosition: PlayerPosition | null;
  winnerPosition: PlayerPosition | null;
};

function getFacingTile(
  position: PlayerPosition,
  direction: PlayerDirection,
): PlayerPosition {
  switch (direction) {
    case "up":
      return {
        x: position.x,
        y: position.y - 1,
      };

    case "down":
      return {
        x: position.x,
        y: position.y + 1,
      };

    case "left":
      return {
        x: position.x - 1,
        y: position.y,
      };

    case "right":
      return {
        x: position.x + 1,
        y: position.y,
      };
  }
}

const TILESET_PATH = "/assets/tiles/dungeon-crawl.png";

const DIRECTION_CIRCLE_SIZE = 12;
const DIRECTION_CIRCLE_RADIUS = DIRECTION_CIRCLE_SIZE / 2;

const ATTACK_PREVIEW_FRAME = {
  x: 1696,
  y: 864,
};

const ATTACK_COOLDOWN_MS = 1_000;

const COOLDOWN_BAR_WIDTH_RATIO = 0.9;
const COOLDOWN_BAR_HEIGHT = 4;
const COOLDOWN_BAR_OFFSET_Y = 34;

const COOLDOWN_READY_COLOR = 0x22c55e;
const COOLDOWN_BACKGROUND_COLOR = 0x18181b;

const OWN_PLAYER_DIRECTION_COLOR = 0x22c55e;
const OTHER_PLAYER_DIRECTION_COLOR = 0xef4444;

const HEALTH_BAR_WIDTH_RATIO = 0.9;
const HEALTH_BAR_HEIGHT_RATIO = 0.12;
const HEALTH_BAR_MIN_HEIGHT = 3;
const HEALTH_FONT_SIZE_RATIO = 0.3;
const HEALTH_MIN_FONT_SIZE = 9;
// Vertical breathing room between the name label, the health value and the bar.
const HEALTH_ELEMENT_GAP = 2;

const HEALTH_HIGH_COLOR = 0x22c55e;
const HEALTH_MEDIUM_COLOR = 0xfacc15;
const HEALTH_LOW_COLOR = 0xef4444;
const HEALTH_MEDIUM_RATIO = 0.5;
const HEALTH_LOW_RATIO = 0.25;

// Colour reinforces the bar length, it never carries the value on its own — the
// number above the bar states it outright.
function getHealthBarColor(ratio: number): number {
  if (ratio > HEALTH_MEDIUM_RATIO) {
    return HEALTH_HIGH_COLOR;
  }

  if (ratio > HEALTH_LOW_RATIO) {
    return HEALTH_MEDIUM_COLOR;
  }

  return HEALTH_LOW_COLOR;
}

export function PixiGameBoard({
  map,
  players,
  status,
  currentPlayerSpawnPosition,
  winnerPosition,
}: PixiGameBoardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playersRef = useRef(players);
  const mapRef = useRef(map);
  const renderPlayersRef = useRef<(() => void) | null>(null);
  const spawnHighlightRef = useRef(currentPlayerSpawnPosition);
  const renderSpawnHighlightRef = useRef<(() => void) | null>(null);
  const winnerHighlightRef = useRef(winnerPosition);
  const renderWinnerHighlightRef = useRef<(() => void) | null>(null);
  const renderMapRef = useRef<(() => void) | null>(null);
  const hiddenAttackPreviewPlayerIdsRef = useRef<Set<string>>(new Set());
  const portalPlayedRef = useRef(false);
  const attackCooldownsRef = useRef<Map<string, number>>(new Map());
  const renderFovRef = useRef<(() => void) | null>(null);

  useInputControls(status === "running");

  useEffect(() => {
    spawnHighlightRef.current = currentPlayerSpawnPosition;
    renderSpawnHighlightRef.current?.();
  }, [currentPlayerSpawnPosition]);

  useEffect(() => {
    winnerHighlightRef.current = winnerPosition;
    renderWinnerHighlightRef.current?.();
  }, [winnerPosition]);

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
      portalPlayedRef.current = false;
      attackCooldownsRef.current.clear();
      renderPlayersRef.current = null;
      renderSpawnHighlightRef.current = null;
      renderWinnerHighlightRef.current = null;
      renderMapRef.current = null;
      renderFovRef.current = null;
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

      // remove "gaps" between tiles
      tilesetTexture.source.scaleMode = "nearest";

      if (isDestroyed || !app) {
        destroyApp();
        return;
      }

      // Hier wird der gemeinsame Manager für alle Animationen einmal erstellt.
      const animationManager = createAnimationManager(tilesetTexture);

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

      const directionLayer = new Container();
      const playerLayer = new Container();
      const attackPreviewLayer = new Container();
      const attackAnimationLayer = new Container();
      const attackCooldownLayer = new Container();
      const portalLayer = new Container();
      const spawnHighlightLayer = new Container();
      const fovLayer = new Container();
      const winnerHighlightLayer = new Container();

      let layout: BoardLayout | null = null;

      function renderAttackCooldowns() {
        if (!layout) {
          return;
        }

        attackCooldownLayer.removeChildren();

        const currentTime = Date.now();
        const { offsetX, offsetY, tileSize } = layout;

        attackCooldownsRef.current.forEach((cooldownEndsAt, playerId) => {
          const remainingTime = cooldownEndsAt - currentTime;

          if (remainingTime <= 0) {
            attackCooldownsRef.current.delete(playerId);
            return;
          }

          const player = playersRef.current.find(
            (currentPlayer) => currentPlayer.id === playerId,
          );

          if (!player) {
            attackCooldownsRef.current.delete(playerId);
            return;
          }

          const remainingRatio = remainingTime / ATTACK_COOLDOWN_MS;

          const barWidth = tileSize * COOLDOWN_BAR_WIDTH_RATIO;
          const barX =
            offsetX + player.position.x * tileSize + (tileSize - barWidth) / 2;

          const barY =
            offsetY + player.position.y * tileSize - COOLDOWN_BAR_OFFSET_Y;

          const cooldownBar = new Graphics()
            .rect(barX, barY, barWidth, COOLDOWN_BAR_HEIGHT)
            .fill({
              color: COOLDOWN_BACKGROUND_COLOR,
              alpha: 0.9,
            });

          cooldownBar
            .rect(barX, barY, barWidth * remainingRatio, COOLDOWN_BAR_HEIGHT)
            .fill({
              color: COOLDOWN_READY_COLOR,
              alpha: 1,
            });

          cooldownBar.rect(barX, barY, barWidth, COOLDOWN_BAR_HEIGHT).stroke({
            width: 1,
            color: 0x000000,
            alpha: 0.9,
          });

          const cooldownLabel = new Text({
            text: `${(remainingTime / 1_000).toFixed(1)}s`,
            style: {
              fontSize: 9,
              fontWeight: "bold",
              fill: 0xffffff,
              stroke: {
                color: 0x000000,
                width: 2,
              },
            },
          });

          cooldownLabel.anchor.set(0.5, 1);
          cooldownLabel.x = offsetX + (player.position.x + 0.5) * tileSize;

          cooldownLabel.y = barY - 2;

          attackCooldownLayer.addChild(cooldownBar, cooldownLabel);
        });
      }

      function playSpawnPortalAnimation() {
        if (!layout || portalPlayedRef.current) {
          return;
        }

        const spawnPosition = spawnHighlightRef.current;

        if (!spawnPosition) {
          return;
        }

        portalPlayedRef.current = true;

        const { offsetX, offsetY, tileSize } = layout;

        const portalX = offsetX + spawnPosition.x * tileSize;
        const portalY = offsetY + spawnPosition.y * tileSize;

        const portalOpen = animationManager.create("portalOpen", {
          x: portalX,
          y: portalY,
          width: tileSize,
          height: tileSize,
          autoPlay: false,
        });

        portalOpen.onComplete = () => {
          portalLayer.removeChild(portalOpen);
          portalOpen.destroy();

          const portalClose = animationManager.create("portalClose", {
            x: portalX,
            y: portalY,
            width: tileSize,
            height: tileSize,
            autoPlay: false,
          });

          portalClose.onComplete = () => {
            portalLayer.removeChild(portalClose);
            portalClose.destroy();
          };

          portalLayer.addChild(portalClose);
          portalClose.play();
        };

        portalLayer.addChild(portalOpen);
        portalOpen.play();
      }
      function playAttackAnimation({
        attackerId,
        targetId,
        targetPosition,
      }: AttackEvent) {
        if (!layout) {
          return;
        }

        attackCooldownsRef.current.set(
          attackerId,
          Date.now() + ATTACK_COOLDOWN_MS,
        );

        renderAttackCooldowns();

        if (!targetId) {
          return;
        }

        const { offsetX, offsetY, tileSize } = layout;

        hiddenAttackPreviewPlayerIdsRef.current.add(attackerId);

        renderPlayers();

        const attackAnimation = animationManager.create("attack", {
          x: offsetX + targetPosition.x * tileSize,
          y: offsetY + targetPosition.y * tileSize,
          width: tileSize,
          height: tileSize,
          autoPlay: false,
        });

        attackAnimation.onComplete = () => {
          attackAnimationLayer.removeChild(attackAnimation);
          attackAnimation.destroy();

          hiddenAttackPreviewPlayerIdsRef.current.delete(attackerId);

          renderPlayers();
        };

        attackAnimationLayer.addChild(attackAnimation);
        attackAnimation.play();
      }

      socket.on("game:attack", playAttackAnimation);

      app.ticker.add(() => {
        const blinkSpeed = 0.005;

        const blinkAlpha =
          0.4 + ((Math.sin(Date.now() * blinkSpeed) + 1) / 2) * 0.6;

        directionLayer.alpha = blinkAlpha;
        attackPreviewLayer.alpha = blinkAlpha;

        renderAttackCooldowns();
      });

      function renderSpawnHighlight() {
        if (!layout) {
          return;
        }

        spawnHighlightLayer.removeChildren();

        const spawn = spawnHighlightRef.current;

        if (!spawn) {
          return;
        }

        spawnHighlightLayer.addChild(
          createTileHighlight({
            position: spawn,
            caption: "You",
            layout,
            mapHeight: mapRef.current.height,
          }),
        );
      }

      renderSpawnHighlightRef.current = renderSpawnHighlight;

      // Marks the winner once the game has ended, using the same highlight as
      // the spawn marker so both read as the same kind of annotation.
      function renderWinnerHighlight() {
        if (!layout) {
          return;
        }

        winnerHighlightLayer.removeChildren();

        const winner = winnerHighlightRef.current;

        if (!winner) {
          return;
        }

        winnerHighlightLayer.addChild(
          createTileHighlight({
            position: winner,
            caption: "Winner",
            layout,
            mapHeight: mapRef.current.height,
          }),
        );
      }

      renderWinnerHighlightRef.current = renderWinnerHighlight;

      function renderFov() {
        if (!layout) {
          return;
        }

        const { offsetX, offsetY, tileSize } = layout;
        fovLayer.removeChildren();

        const localPlayer = playersRef.current.find(
          (player) => player.id === socket.id,
        );

        const fogFrameX = 768;
        const fogFrameY = 608;

        const fogContainer = new Container();

        const playerX = localPlayer ? localPlayer.position.x : -999;
        const playerY = localPlayer ? localPlayer.position.y : -999;
        const visionRange = localPlayer?.visionRange ?? 3;

        for (let y = 0; y < map.height; y++) {
          for (let x = 0; x < map.width; x++) {
            const dx = Math.abs(x - playerX);
            const dy = Math.abs(y - playerY);
            const distance = Math.max(dx, dy);

            if (localPlayer && distance <= visionRange - 1) {
              continue;
            }

            const fogSprite = createTileSprite(
              fogFrameX,
              fogFrameY,
              x * tileSize,
              y * tileSize,
              tileSize,
            );

            // add some alpha to the edges of the vision range to make it look more blurry
            if (localPlayer && distance === visionRange) {
              fogSprite.alpha = 0.4;
            }

            fogContainer.addChild(fogSprite);
          }
        }

        const colorMatrix = new ColorMatrixFilter();
        colorMatrix.desaturate();

        fogContainer.filters = [colorMatrix];
        fogContainer.tint = 0x222222; // darkness
        fogContainer.alpha = 0.9; // opacity

        fogContainer.x = offsetX;
        fogContainer.y = offsetY;

        fovLayer.addChild(fogContainer);
      }

      renderFovRef.current = renderFov;

      function renderPlayers() {
        if (!layout) {
          return;
        }

        const { offsetX, offsetY, tileSize } = layout;

        directionLayer.removeChildren();
        playerLayer.removeChildren();
        attackPreviewLayer.removeChildren();

        playersRef.current.forEach((player) => {
          const frame =
            playerTextureFrames[
              player.spriteIndex % playerTextureFrames.length
            ];

          const playerSprite = createTileSprite(
            frame.x,
            frame.y,
            offsetX + player.position.x * tileSize,
            offsetY + player.position.y * tileSize,
            tileSize,
          );

          playerLayer.addChild(playerSprite);

          const facingTile = getFacingTile(
            player.position,
            player.facingDirection,
          );

          const targetPlayer = playersRef.current.find((otherPlayer) => {
            return (
              otherPlayer.id !== player.id &&
              otherPlayer.position.x === facingTile.x &&
              otherPlayer.position.y === facingTile.y
            );
          });

          const isOwnPlayer = player.id === socket.id;

          const attackPreviewIsHidden =
            hiddenAttackPreviewPlayerIdsRef.current.has(player.id);

          if (targetPlayer && !attackPreviewIsHidden) {
            const attackPreviewSprite = createTileSprite(
              ATTACK_PREVIEW_FRAME.x,
              ATTACK_PREVIEW_FRAME.y,
              offsetX + targetPlayer.position.x * tileSize,
              offsetY + targetPlayer.position.y * tileSize,
              tileSize,
            );

            attackPreviewSprite.alpha = 0.85;

            attackPreviewLayer.addChild(attackPreviewSprite);
          } else {
            const circleColor = isOwnPlayer
              ? OWN_PLAYER_DIRECTION_COLOR
              : OTHER_PLAYER_DIRECTION_COLOR;

            const circleCenterX =
              offsetX + facingTile.x * tileSize + tileSize / 2;

            const circleCenterY =
              offsetY + facingTile.y * tileSize + tileSize / 2;

            const directionCircle = new Graphics();

            directionCircle
              .circle(circleCenterX, circleCenterY, DIRECTION_CIRCLE_RADIUS)
              .fill({
                color: circleColor,
                alpha: 0.9,
              });

            directionLayer.addChild(directionCircle);
          }

          const centerX = offsetX + (player.position.x + 0.5) * tileSize;

          const tileTopY = offsetY + player.position.y * tileSize;

          const barWidth = tileSize * HEALTH_BAR_WIDTH_RATIO;

          const barHeight = Math.max(
            HEALTH_BAR_MIN_HEIGHT,
            Math.round(tileSize * HEALTH_BAR_HEIGHT_RATIO),
          );

          const barX = centerX - barWidth / 2;
          const barY = tileTopY - HEALTH_ELEMENT_GAP - barHeight;

          // The server keeps health within 0…maxHealth, so only the division
          // itself needs guarding.
          const healthRatio =
            player.maxHealth > 0 ? player.health / player.maxHealth : 0;

          const healthBar = new Graphics()
            .rect(barX, barY, barWidth, barHeight)
            .fill({
              color: 0x000000,
              alpha: 0.65,
            });

          // A zero-width fill would still paint a hairline, so a dead player
          // only gets the empty track.
          if (healthRatio > 0) {
            healthBar.rect(barX, barY, barWidth * healthRatio, barHeight).fill({
              color: getHealthBarColor(healthRatio),
            });
          }

          healthBar.rect(barX, barY, barWidth, barHeight).stroke({
            width: 1,
            color: 0x000000,
            alpha: 0.9,
          });

          const healthLabel = new Text({
            text: `${player.health}/${player.maxHealth}`,
            style: {
              fontSize: Math.max(
                HEALTH_MIN_FONT_SIZE,
                Math.round(tileSize * HEALTH_FONT_SIZE_RATIO),
              ),
              fontWeight: "bold",
              fill: 0xffffff,
              stroke: {
                color: 0x000000,
                width: 2,
              },
            },
          });

          healthLabel.anchor.set(0.5, 1);
          healthLabel.x = centerX;
          healthLabel.y = barY - HEALTH_ELEMENT_GAP;

          const playerLabel = new Text({
            text: player.label,
            style: {
              fontSize: 12,
              fontWeight: "bold",
              fill: 0xffffff,
              stroke: {
                color: 0x000000,
                width: 2,
              },
            },
          });

          playerLabel.anchor.set(0.5, 1);
          playerLabel.alpha = 0.5;
          playerLabel.x = centerX;
          playerLabel.y = healthLabel.y - healthLabel.height;

          playerLayer.addChild(playerLabel, healthLabel, healthBar);
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
          const objectX = offsetX + object.x * tileSize;
          const objectY = offsetY + object.y * tileSize;
          // Wasser wird vollständig über den gemeinsamen Manager erstellt.
          if (object.type === "water") {
            const animatedWater = animationManager.create("water", {
              x: objectX,
              y: objectY,
              width: tileSize,
              height: tileSize,
            });

            app?.stage.addChild(animatedWater);
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

          app?.stage.addChild(objectSprite);
        });

        app.stage.addChild(directionLayer);
        app.stage.addChild(playerLayer);
        app.stage.addChild(attackPreviewLayer);
        app.stage.addChild(attackAnimationLayer);
        app.stage.addChild(attackCooldownLayer);
        app.stage.addChild(portalLayer);
        app.stage.addChild(spawnHighlightLayer);
        app.stage.addChild(fovLayer);
        app.stage.addChild(winnerHighlightLayer);

        layout = {
          offsetX,
          offsetY,
          tileSize,
        };

        layout = { offsetX, offsetY, tileSize };
        renderPlayers();
        renderSpawnHighlight();
        renderFov();
        renderWinnerHighlight();
        playSpawnPortalAnimation();
      }

      renderMapRef.current = renderMap;
      renderMap();

      const resizeObserver = new ResizeObserver(() => {
        renderMap();
      });

      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
        socket.off("game:attack", playAttackAnimation);
      };
    }

    let cleanupResizeObserver: (() => void) | undefined;

    const setupDone = setupPixi().then((cleanup) => {
      cleanupResizeObserver = cleanup;
    });

    return () => {
      isDestroyed = true;
      setupDone.then(() => {
        cleanupResizeObserver?.();
        destroyApp();
      });
    };
  }, [map.height, map.width]);

  useEffect(() => {
    mapRef.current = map;
    renderMapRef.current?.();
  }, [map]);

  useEffect(() => {
    playersRef.current = players;
    renderPlayersRef.current?.();
    renderFovRef.current?.();
  }, [players]);

  return <div className={styles.canvasHost} ref={containerRef} />;
}
