import { GameMap } from "../types/map";

export const exampleMap: GameMap = {
  name: "Forest Ruins",
  width: 5,
  height: 5,
  tiles: [
    ["wall", "wall", "wall", "wall", "wall"],
    ["wall", "spawn", "floor", "tree", "wall"],
    ["wall", "floor", "floor", "floor", "wall"],
    ["wall", "rock", "floor", "spawn", "wall"],
    ["wall", "wall", "wall", "wall", "wall"],
  ],
};
