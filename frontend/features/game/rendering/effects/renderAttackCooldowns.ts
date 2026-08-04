import { Graphics, Text, type Container } from "pixi.js";
import type { BoardLayout } from "../../components/boardLayout";
import type { GameMap } from "../../types/map";
import type { GamePlayer } from "../shared/types";
import { isPlayerConcealed } from "../players/concealment";
import {
  ATTACK_COOLDOWN_MS,
  COOLDOWN_BACKGROUND_COLOR,
  COOLDOWN_BAR_HEIGHT,
  COOLDOWN_BAR_WIDTH_RATIO,
  COOLDOWN_READY_COLOR,
} from "../shared/constants";

type RenderAttackCooldownsOptions = {
  layer: Container;
  map: GameMap;
  players: GamePlayer[];
  localPlayerId: string | undefined;
  cooldowns: Map<string, number>;
  layout: BoardLayout;
};

export function renderAttackCooldowns({
  layer,
  map,
  players,
  localPlayerId,
  cooldowns,
  layout,
}: RenderAttackCooldownsOptions) {
  layer.removeChildren();

  const currentTime = Date.now();
  const { offsetX, offsetY, tileSize } = layout;

  cooldowns.forEach((cooldownEndsAt, playerId) => {
    const remainingTime = cooldownEndsAt - currentTime;

    if (remainingTime <= 0) {
      cooldowns.delete(playerId);
      return;
    }

    const player = players.find(
      (currentPlayer) => currentPlayer.id === playerId,
    );

    if (!player) {
      cooldowns.delete(playerId);
      return;
    }

    // A cooldown bar over a bush would point straight at whoever is hiding in
    // it, so attacking from cover stays quiet as well.
    if (isPlayerConcealed({ map, player, players, localPlayerId })) {
      return;
    }

    const remainingRatio = remainingTime / ATTACK_COOLDOWN_MS;

    const barWidth = tileSize * COOLDOWN_BAR_WIDTH_RATIO;

    const barX =
      offsetX + player.position.x * tileSize + (tileSize - barWidth) / 2;

    const barY = offsetY + (player.position.y + 1) * tileSize + 4;

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

    cooldownLabel.y = barY + COOLDOWN_BAR_HEIGHT + 12;

    layer.addChild(cooldownBar, cooldownLabel);
  });
}
