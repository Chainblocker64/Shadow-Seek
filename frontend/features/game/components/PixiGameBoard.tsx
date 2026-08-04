"use client";

import styles from "./PixiGameBoard.module.css";
import { Application, Assets, Container, Texture } from "pixi.js";
import { useEffect, useRef } from "react";
import { socket } from "@/lib/socket";
import { useInputControls } from "../hooks/useInputControls";
import { calculateBoardLayout, type BoardLayout } from "./boardLayout";
import { createAnimationManager } from "../animations/createAnimationManager";
import type {
  AttackEvent,
  PixiGameBoardProps,
} from "../rendering/shared/types";
import { TILESET_PATH } from "../rendering/shared/constants";
import { createTileFactory } from "../rendering/shared/tileFactory";
import { renderAttackCooldowns } from "../rendering/effects/renderAttackCooldowns";
import { renderFov } from "../rendering/effects/renderFov";
import {
  renderSpawnHighlight,
  renderWinnerHighlight,
} from "../rendering/effects/renderHighlights";
import { playSpawnPortalAnimation } from "../rendering/effects/playSpawnPortalAnimation";
import { playAttackAnimation } from "../rendering/effects/playAttackAnimation";
import { renderPlayers as renderPlayersContent } from "../rendering/players/renderPlayers";
import { renderMap as renderMapContent } from "../rendering/map/renderMap";

export function PixiGameBoard({
  map,
  players,
  status,
  currentPlayerSpawnPosition,
  winnerPosition,
  isSpectating = false,
}: PixiGameBoardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playersRef = useRef(players);
  const mapRef = useRef(map);
  const renderPlayersRef = useRef<(() => void) | null>(null);
  const renderMapRef = useRef<(() => void) | null>(null);
  const renderFovRef = useRef<(() => void) | null>(null);
  const spawnHighlightRef = useRef(currentPlayerSpawnPosition);
  const renderSpawnHighlightRef = useRef<(() => void) | null>(null);
  const winnerHighlightRef = useRef(winnerPosition);
  const renderWinnerHighlightRef = useRef<(() => void) | null>(null);
  const hiddenAttackPreviewPlayerIdsRef = useRef<Set<string>>(new Set());
  const attackCooldownsRef = useRef<Map<string, number>>(new Map());
  const portalPlayedRef = useRef(false);
  const isSpectatingRef = useRef(isSpectating);

  useInputControls(status === "running" && !isSpectating);

  useEffect(() => {
    isSpectatingRef.current = isSpectating;
    renderFovRef.current?.();
  }, [isSpectating]);

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

    function destroyApp() {
      app?.destroy(true);
      app = null;
      portalPlayedRef.current = false;
      attackCooldownsRef.current.clear();
      hiddenAttackPreviewPlayerIdsRef.current.clear();
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

      // Der Nearest-Modus verhindert sichtbare Lücken zwischen Pixel-Tiles.
      tilesetTexture.source.scaleMode = "nearest";

      if (isDestroyed || !app) {
        destroyApp();
        return;
      }

      const animationManager = createAnimationManager(tilesetTexture);
      const { createTileSprite } = createTileFactory(tilesetTexture);
      const directionLayer = new Container();
      const swimmingOverlayLayer = new Container();
      const playerLayer = new Container();
      const attackPreviewLayer = new Container();
      const attackAnimationLayer = new Container();
      const attackCooldownLayer = new Container();
      const portalLayer = new Container();
      const spawnHighlightLayer = new Container();
      const fovLayer = new Container();
      const winnerHighlightLayer = new Container();

      let layout: BoardLayout | null = null;

      function updateSpawnHighlight() {
        if (!layout) {
          return;
        }

        renderSpawnHighlight({
          layer: spawnHighlightLayer,
          position: spawnHighlightRef.current,
          layout,
          mapHeight: mapRef.current.height,
        });
      }

      function updateWinnerHighlight() {
        if (!layout) {
          return;
        }

        renderWinnerHighlight({
          layer: winnerHighlightLayer,
          position: winnerHighlightRef.current,
          layout,
          mapHeight: mapRef.current.height,
        });
      }

      renderSpawnHighlightRef.current = updateSpawnHighlight;
      renderWinnerHighlightRef.current = updateWinnerHighlight;

      function updateFov() {
        if (!layout) {
          return;
        }

        renderFov({
          layer: fovLayer,
          map: mapRef.current,
          players: playersRef.current,
          localPlayerId: socket.id,
          layout,
          createTileSprite,
          isSpectating: isSpectatingRef.current,
        });
      }

      renderFovRef.current = updateFov;

      function updateAttackCooldowns() {
        if (!layout) {
          return;
        }

        renderAttackCooldowns({
          layer: attackCooldownLayer,
          map: mapRef.current,
          players: playersRef.current,
          localPlayerId: socket.id,
          cooldowns: attackCooldownsRef.current,
          layout,
        });
      }

      function updateSpawnPortalAnimation() {
        if (!layout) {
          return;
        }

        portalPlayedRef.current = playSpawnPortalAnimation({
          layer: portalLayer,
          spawnPosition: spawnHighlightRef.current,
          layout,
          animationManager,
          hasPlayed: portalPlayedRef.current,
        });
      }

      function renderPlayers() {
        if (!layout) {
          return;
        }

        renderPlayersContent({
          layout,
          map: mapRef.current,
          layer: playerLayer,
          swimmingOverlayLayer,
          directionLayer,
          attackPreviewLayer,
          players: playersRef.current,
          localPlayerId: socket.id,
          hiddenAttackPreviewPlayerIds: hiddenAttackPreviewPlayerIdsRef.current,
          animationManager,
          createTileSprite,
        });
      }

      renderPlayersRef.current = renderPlayers;

      function handleAttackAnimation(event: AttackEvent) {
        if (!layout) {
          return;
        }

        playAttackAnimation({
          event,
          layout,
          animationManager,
          attackAnimationLayer,
          attackCooldowns: attackCooldownsRef.current,
          hiddenAttackPreviewPlayerIds: hiddenAttackPreviewPlayerIdsRef.current,
          updateAttackCooldowns,
          updatePlayers: renderPlayers,
        });
      }

      socket.on("game:attack", handleAttackAnimation);

      app.ticker.add(() => {
        const blinkSpeed = 0.005;

        const blinkAlpha =
          0.4 + ((Math.sin(Date.now() * blinkSpeed) + 1) / 2) * 0.6;

        directionLayer.alpha = blinkAlpha;
        attackPreviewLayer.alpha = blinkAlpha;

        updateAttackCooldowns();
      });

      function renderMap() {
        if (!app || !container) {
          return;
        }

        const nextLayout = renderMapContent({
          app,
          container,
          map: mapRef.current,
          animationManager,
          createTileSprite,
          calculateLayout: calculateBoardLayout,
          layers: {
            directionLayer,
            playerLayer,
            swimmingOverlayLayer,
            attackPreviewLayer,
            attackAnimationLayer,
            attackCooldownLayer,
            portalLayer,
            spawnHighlightLayer,
            fovLayer,
            winnerHighlightLayer,
          },
        });

        if (!nextLayout) {
          return;
        }

        layout = nextLayout;

        renderPlayers();
        updateSpawnHighlight();
        updateFov();
        updateWinnerHighlight();
        updateSpawnPortalAnimation();
      }

      renderMapRef.current = renderMap;
      renderMap();

      const resizeObserver = new ResizeObserver(() => {
        renderMap();
      });

      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
        socket.off("game:attack", handleAttackAnimation);
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
