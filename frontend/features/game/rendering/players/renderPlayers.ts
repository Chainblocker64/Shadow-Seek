import { Container, Graphics, type Sprite } from "pixi.js";

import {
  ATTACK_PREVIEW_FRAME,
  CONCEALED_OWN_PLAYER_ALPHA,
  CONCEALED_PLAYER_ALPHA,
  CONCEALING_OBJECT_ALPHA,
  DIRECTION_CIRCLE_RADIUS,
  OTHER_PLAYER_DIRECTION_COLOR,
  OWN_PLAYER_DIRECTION_COLOR,
} from "../shared/constants";

import { findCoverFor } from "./concealment";
import { getFacingTile } from "./playerUtils";
import { renderHealthBar } from "./renderHealthBar";
import { renderSwimmingEffect } from "./renderSwimmingEffects";

import {
  defeatedPlayerTextureFrame,
  mapObjectTextureFrames,
  playerTextureFrames,
} from "../../data/tileTextureFrames";

import type { BoardLayout } from "../../components/boardLayout";
import {
  findConcealingObjectAt,
  type GameMap,
} from "../../types/map";
import type { createAnimationManager } from "../../animations/createAnimationManager";
import type { GamePlayer } from "../shared/types";

type RenderPlayersOptions = {
  layout: BoardLayout;
  layer: Container;
  swimmingOverlayLayer: Container;
  directionLayer: Container;
  attackPreviewLayer: Container;
  map: GameMap;
  players: GamePlayer[];
  localPlayerId: string | undefined;
  hiddenAttackPreviewPlayerIds: Set<string>;
  animationManager: ReturnType<typeof createAnimationManager>;

  createTileSprite: (
    frameX: number,
    frameY: number,
    x: number,
    y: number,
    tileSize: number,
  ) => Sprite;
};

export function renderPlayers({
  layout,
  layer,
  swimmingOverlayLayer,
  directionLayer,
  attackPreviewLayer,
  map,
  players,
  localPlayerId,
  hiddenAttackPreviewPlayerIds,
  animationManager,
  createTileSprite,
}: RenderPlayersOptions) {
  const { offsetX, offsetY, tileSize } = layout;

  directionLayer.removeChildren();
  swimmingOverlayLayer.removeChildren();
  layer.removeChildren();
  attackPreviewLayer.removeChildren();

  const defeatedPlayers = players.filter(
    (player) => player.status === "defeated",
  );

  const alivePlayers = players.filter((player) => player.status !== "defeated");

  [...defeatedPlayers, ...alivePlayers].forEach((player) => {
    const frame =
      player.status === "defeated"
        ? defeatedPlayerTextureFrame
        : playerTextureFrames[player.spriteIndex % playerTextureFrames.length];

    const isOwnPlayer = player.id === localPlayerId;
    const concealingObject = findConcealingObjectAt(map, player.position);
    const cover = findCoverFor({ map, player, players, localPlayerId });
    const playerIsConcealed = cover !== null && !isOwnPlayer;

    const playerX = offsetX + player.position.x * tileSize;
    const playerY = offsetY + player.position.y * tileSize;

    const playerSprite = createTileSprite(
      frame.x,
      frame.y,
      playerX,
      playerY,
      tileSize,
    );

    if (cover) {
      playerSprite.alpha = isOwnPlayer
        ? CONCEALED_OWN_PLAYER_ALPHA
        : CONCEALED_PLAYER_ALPHA;
    }

    layer.addChild(playerSprite);

    renderSwimmingEffect({
      layer: swimmingOverlayLayer,
      cover: concealingObject,
      layout,
      animationManager,
    });

    // The map already drew the cover below the player, so draw it a second
    // time on top: the sprite then reads as standing inside the bush instead
    // of on it.
    if (cover && cover.type !== "water") {
      const coverFrame = mapObjectTextureFrames[cover.type];

      const coverSprite = createTileSprite(
        coverFrame.x,
        coverFrame.y,
        playerX,
        playerY,
        tileSize,
      );

      coverSprite.alpha = CONCEALING_OBJECT_ALPHA;

      layer.addChild(coverSprite);
    }

    const facingTile = getFacingTile(player.position, player.facingDirection);

    const targetPlayer = players.find((otherPlayer) => {
      return (
        otherPlayer.id !== player.id &&
        otherPlayer.position.x === facingTile.x &&
        otherPlayer.position.y === facingTile.y
      );
    });

    const attackPreviewIsHidden = hiddenAttackPreviewPlayerIds.has(player.id);

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
    } else if (!playerIsConcealed) {
      const circleColor = isOwnPlayer
        ? OWN_PLAYER_DIRECTION_COLOR
        : OTHER_PLAYER_DIRECTION_COLOR;

      const directionCircle = new Graphics();

      directionCircle
        .circle(
          offsetX + facingTile.x * tileSize + tileSize / 2,
          offsetY + facingTile.y * tileSize + tileSize / 2,
          DIRECTION_CIRCLE_RADIUS,
        )
        .fill({
          color: circleColor,
          alpha: 0.9,
        });

      directionLayer.addChild(directionCircle);
    }

    // Name, health value and health bar are what make a player jump out of
    // the board. Cover takes them away and leaves the silhouette.
    if (playerIsConcealed) {
      return;
    }

    renderHealthBar({
      layer,
      player,
      layout,
      // Only ever true for your own player, since concealed enemies returned
      // above: the dimmed sprite alone is easy to miss, so say outright that
      // the cover is working.
      showsHiddenHint: cover !== null,
    });
  });
}
