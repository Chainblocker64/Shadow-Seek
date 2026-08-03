import { AnimatedSprite, Texture } from "pixi.js";

type CreateAnimatedSpriteProps = {
  textures: Texture[];
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  loop?: boolean;
};

export function createAnimatedSprite({
  textures,
  x,
  y,
  width,
  height,
  speed,
  loop = true,
}: CreateAnimatedSpriteProps) {
  const sprite = new AnimatedSprite(textures);

  sprite.x = x;
  sprite.y = y;

  sprite.width = width;
  sprite.height = height;

  sprite.animationSpeed = speed;
  sprite.loop = loop;

  sprite.play();

  return sprite;
}
