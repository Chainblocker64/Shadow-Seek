import type { Container } from "pixi.js";
import type { createAnimationManager } from "../../animations/createAnimationManager";
import type { BoardLayout } from "../../components/boardLayout";
import type { AttackEvent } from "../shared/types";
import { ATTACK_COOLDOWN_MS } from "../shared/constants";

type AnimationManager = ReturnType<typeof createAnimationManager>;

type PlayAttackAnimationOptions = {
  event: AttackEvent;
  layout: BoardLayout;
  animationManager: AnimationManager;
  attackAnimationLayer: Container;
  attackCooldowns: Map<string, number>;
  hiddenAttackPreviewPlayerIds: Set<string>;
  updateAttackCooldowns: () => void;
  updatePlayers: () => void;
};

export function playAttackAnimation({
  event,
  layout,
  animationManager,
  attackAnimationLayer,
  attackCooldowns,
  hiddenAttackPreviewPlayerIds,
  updateAttackCooldowns,
  updatePlayers,
}: PlayAttackAnimationOptions) {
  const { attackerId, targetId, targetPosition } = event;

  attackCooldowns.set(attackerId, Date.now() + ATTACK_COOLDOWN_MS);

  updateAttackCooldowns();

  if (!targetId) {
    return;
  }

  const { offsetX, offsetY, tileSize } = layout;

  hiddenAttackPreviewPlayerIds.add(attackerId);

  updatePlayers();

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

    hiddenAttackPreviewPlayerIds.delete(attackerId);

    updatePlayers();
  };

  attackAnimationLayer.addChild(attackAnimation);
  attackAnimation.play();
}
