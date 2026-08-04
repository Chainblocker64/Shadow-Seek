import { Rectangle, Sprite, Texture } from "pixi.js";
import { TILE_TEXTURE_SIZE } from "../../data/tileTextureFrames";

export type TileFactory = {
  createTileTexture: (frameX: number, frameY: number) => Texture;

  createTileSprite: (
    frameX: number,
    frameY: number,
    x: number,
    y: number,
    tileSize: number,
  ) => Sprite;
};

// Diese Factory verwendet eine bereits geladene Tileset-Textur.
// Dadurch muss die Textur nicht bei jedem Sprite erneut geladen werden.
export function createTileFactory(tilesetTexture: Texture): TileFactory {
  function createTileTexture(frameX: number, frameY: number): Texture {
    return new Texture({
      source: tilesetTexture.source,
      frame: new Rectangle(
        frameX,
        frameY,
        TILE_TEXTURE_SIZE,
        TILE_TEXTURE_SIZE,
      ),
    });
  }

  function createTileSprite(
    frameX: number,
    frameY: number,
    x: number,
    y: number,
    tileSize: number,
  ): Sprite {
    const texture = createTileTexture(frameX, frameY);
    const sprite = new Sprite(texture);

    sprite.x = x;
    sprite.y = y;
    sprite.width = tileSize;
    sprite.height = tileSize;

    return sprite;
  }

  return {
    createTileTexture,
    createTileSprite,
  };
}
