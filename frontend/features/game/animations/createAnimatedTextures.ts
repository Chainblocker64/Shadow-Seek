import { Rectangle, Texture } from "pixi.js";
import { TILE_TEXTURE_SIZE } from "../data/tileTextureFrames";
import type { AnimationFrame } from "./animationDefinitions";

export function createAnimatedTextures(
  tilesetTexture: Texture,
  frames: AnimationFrame[],
): Texture[] {
  return frames.map((frame) => {
    return new Texture({
      source: tilesetTexture.source,
      frame: new Rectangle(
        frame.x,
        frame.y,
        TILE_TEXTURE_SIZE,
        TILE_TEXTURE_SIZE,
      ),
    });
  });
}
