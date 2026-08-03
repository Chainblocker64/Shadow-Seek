import { AnimatedSprite, Texture } from "pixi.js";

type CreateAnimatedTileProps = {
  textures: Texture[];
  x: number;
  y: number;
  tileSize: number;
  speed: number;
  loop: boolean;
};

export function createAnimatedTile({
  textures,
  x,
  y,
  tileSize,
  speed,
  loop,
}: CreateAnimatedTileProps) {
  const sprite = new AnimatedSprite(textures);

  sprite.x = x;
  sprite.y = y;

  sprite.width = tileSize;
  sprite.height = tileSize;

  sprite.animationSpeed = speed;

  sprite.loop = loop;

  sprite.play();

  return sprite;
}
