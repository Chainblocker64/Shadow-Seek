import { Container, Graphics, type Sprite } from "pixi.js";
import { socket } from "@/lib/socket";

import {
  ATTACK_PREVIEW_FRAME,
  DIRECTION_CIRCLE_RADIUS,
  OTHER_PLAYER_DIRECTION_COLOR,
  OWN_PLAYER_DIRECTION_COLOR,
} from "../shared/constants";

import { getFacingTile } from "./playerUtils";
import { renderHealthBar } from "./renderHealthBar";

import {
  defeatedPlayerTextureFrame,
  playerTextureFrames,
} from "../../data/tileTextureFrames";

import type { BoardLayout } from "../../components/boardLayout";
import type { GamePlayer } from "../shared/types";

type RenderPlayersOptions = {
  layout: BoardLayout;
  layer: Container;
  directionLayer: Container;
  attackPreviewLayer: Container;
  players: GamePlayer[];
  hiddenAttackPreviewPlayerIds: Set<string>;

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
  directionLayer,
  attackPreviewLayer,
  players,
  hiddenAttackPreviewPlayerIds,
  createTileSprite,
}: RenderPlayersOptions) {
  const { offsetX, offsetY, tileSize } = layout;

  directionLayer.removeChildren();
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

    const playerSprite = createTileSprite(
      frame.x,
      frame.y,
      offsetX + player.position.x * tileSize,
      offsetY + player.position.y * tileSize,
      tileSize,
    );

    layer.addChild(playerSprite);

    const facingTile = getFacingTile(player.position, player.facingDirection);

    const targetPlayer = players.find((otherPlayer) => {
      return (
        otherPlayer.id !== player.id &&
        otherPlayer.position.x === facingTile.x &&
        otherPlayer.position.y === facingTile.y
      );
    });

    const isOwnPlayer = player.id === socket.id;

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
    } else {
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

    renderHealthBar({
      layer,
      player,
      layout,
    });
  });
}
