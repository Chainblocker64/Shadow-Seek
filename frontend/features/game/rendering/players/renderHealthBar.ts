import { Graphics, Text, type Container } from "pixi.js";
import type { GamePlayer } from "../shared/types";
import type { BoardLayout } from "../../components/boardLayout";
import {
  CONCEALED_HINT_COLOR,
  HEALTH_BAR_HEIGHT_RATIO,
  HEALTH_BAR_MIN_HEIGHT,
  HEALTH_BAR_WIDTH_RATIO,
  HEALTH_ELEMENT_GAP,
  HEALTH_FONT_SIZE_RATIO,
  HEALTH_MIN_FONT_SIZE,
} from "../shared/constants";
import { getHealthBarColor } from "./playerUtils";

type RenderHealthBarOptions = {
  layer: Container;
  player: GamePlayer;
  layout: BoardLayout;
  showsHiddenHint?: boolean;
};

export function renderHealthBar({
  layer,
  player,
  layout,
  showsHiddenHint = false,
}: RenderHealthBarOptions) {
  const { offsetX, offsetY, tileSize } = layout;

  const centerX = offsetX + (player.position.x + 0.5) * tileSize;

  const tileTopY = offsetY + player.position.y * tileSize;

  const barWidth = tileSize * HEALTH_BAR_WIDTH_RATIO;

  const barHeight = Math.max(
    HEALTH_BAR_MIN_HEIGHT,
    Math.round(tileSize * HEALTH_BAR_HEIGHT_RATIO),
  );

  const barX = centerX - barWidth / 2;

  const barY = tileTopY - HEALTH_ELEMENT_GAP - barHeight;

  const healthRatio =
    player.maxHealth > 0 ? player.health / player.maxHealth : 0;

  const healthBar = new Graphics().rect(barX, barY, barWidth, barHeight).fill({
    color: 0x000000,
    alpha: 0.65,
  });

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

  layer.addChild(playerLabel, healthLabel, healthBar);

  if (!showsHiddenHint) {
    return;
  }

  const hiddenLabel = new Text({
    text: "Hidden",
    style: {
      fontSize: 11,
      fontWeight: "bold",
      fill: CONCEALED_HINT_COLOR,
      stroke: {
        color: 0x000000,
        width: 2,
      },
    },
  });

  hiddenLabel.anchor.set(0.5, 1);
  hiddenLabel.x = centerX;
  hiddenLabel.y = playerLabel.y - playerLabel.height;

  layer.addChild(hiddenLabel);
}
