import { AnimatedSprite, Texture } from "pixi.js";
import {
  animationDefinitions,
  type AnimationName,
} from "./animationDefinitions";
import { createAnimatedTextures } from "./createAnimatedTextures";

type CreateAnimationOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  autoPlay?: boolean;
};

export function createAnimationManager(tilesetTexture: Texture) {
  const preparedAnimations = Object.fromEntries(
    Object.entries(animationDefinitions).map(([name, definition]) => {
      return [
        name,
        {
          ...definition,
          textures: createAnimatedTextures(tilesetTexture, definition.frames),
        },
      ];
    }),
  ) as {
    [Name in AnimationName]: (typeof animationDefinitions)[Name] & {
      textures: Texture[];
    };
  };

  function create(
    name: AnimationName,
    { x, y, width, height, autoPlay = true }: CreateAnimationOptions,
  ): AnimatedSprite {
    const animation = preparedAnimations[name];

    const sprite = new AnimatedSprite(animation.textures);

    sprite.x = x;
    sprite.y = y;
    sprite.width = width;
    sprite.height = height;
    sprite.animationSpeed = animation.speed;
    sprite.loop = animation.loop;

    if (autoPlay) {
      sprite.play();
    }

    return sprite;
  }

  return {
    create,
  };
}
