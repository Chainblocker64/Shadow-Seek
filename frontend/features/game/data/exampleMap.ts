import type {
  BaseTileOverride,
  BaseTileType,
  GameMap,
  MapObject,
  MapObjectType,
} from "../types/map";

// Diese Hilfsfunktion erstellt mehrere Map-Objekte auf einmal.
// Map-Objekte sind Dinge auf dem Boden, zum Beispiel wall, tree, rock oder chest.
function createObjects(
  type: MapObjectType,
  coordinates: Array<[number, number]>,
): MapObject[] {
  return coordinates.map(([x, y]) => ({
    x,
    y,
    type,
  }));
}

// Diese Hilfsfunktion erstellt eine horizontale Linie aus Map-Objekten.
// Wir benutzen sie zum Beispiel für Mauern.
function createHorizontalLine(
  type: MapObjectType,
  y: number,
  startX: number,
  endX: number,
): MapObject[] {
  const objects: MapObject[] = [];

  for (let x = startX; x <= endX; x++) {
    objects.push({
      x,
      y,
      type,
    });
  }

  return objects;
}

// Diese Hilfsfunktion erstellt eine vertikale Linie aus Map-Objekten.
// Wir benutzen sie zum Beispiel für Außenwände.
function createVerticalLine(
  type: MapObjectType,
  x: number,
  startY: number,
  endY: number,
): MapObject[] {
  const objects: MapObject[] = [];

  for (let y = startY; y <= endY; y++) {
    objects.push({
      x,
      y,
      type,
    });
  }

  return objects;
}

// Diese Hilfsfunktion erstellt mehrere Boden-Tiles auf einmal.
// Boden-Tiles sind zum Beispiel dirt oder stoneFloor.
function createBaseTiles(
  type: BaseTileType,
  coordinates: Array<[number, number]>,
): BaseTileOverride[] {
  return coordinates.map(([x, y]) => ({
    x,
    y,
    type,
  }));
}

// Diese Hilfsfunktion erstellt eine horizontale Linie aus Boden-Tiles.
// Wir benutzen sie für Tempelboden, Wege oder Uferbereiche.
function createHorizontalBaseLine(
  type: BaseTileType,
  y: number,
  startX: number,
  endX: number,
): BaseTileOverride[] {
  const tiles: BaseTileOverride[] = [];

  for (let x = startX; x <= endX; x++) {
    tiles.push({
      x,
      y,
      type,
    });
  }

  return tiles;
}

// Diese Hilfsfunktion erstellt eine vertikale Linie aus Boden-Tiles.
// Wir benutzen sie für Wege, die nach oben oder unten laufen.
function createVerticalBaseLine(
  type: BaseTileType,
  x: number,
  startY: number,
  endY: number,
): BaseTileOverride[] {
  const tiles: BaseTileOverride[] = [];

  for (let y = startY; y <= endY; y++) {
    tiles.push({
      x,
      y,
      type,
    });
  }

  return tiles;
}

export const exampleMap: GameMap = {
  name: "Forgotten Forest Temple",
  width: 25,
  height: 25,
  baseTile: "grass",

  baseOverrides: [
    // Tempelboden Reihe für Tempel links.
    ...createHorizontalBaseLine("stoneFloor", 5, 4, 7),
    ...createHorizontalBaseLine("stoneFloor", 6, 4, 7),
    ...createHorizontalBaseLine("stoneFloor", 7, 4, 7),
    ...createHorizontalBaseLine("stoneFloor", 8, 4, 7),

    // Tempelboden Reihe für Tempel rechts.
    ...createHorizontalBaseLine("stoneFloor", 5, 17, 20),
    ...createHorizontalBaseLine("stoneFloor", 6, 17, 20),
    ...createHorizontalBaseLine("stoneFloor", 7, 17, 20),
    ...createHorizontalBaseLine("stoneFloor", 8, 17, 20),

    // Dirt-Weg von unten zum Tempel.
    ...createVerticalBaseLine("dirt", 2, 15, 20),
    ...createHorizontalBaseLine("dirt", 15, 2, 5),
    ...createHorizontalBaseLine("dirt", 4, 3, 8),
    ...createVerticalBaseLine("dirt", 5, 15, 16),
    ...createHorizontalBaseLine("dirt", 16, 5, 7),
    ...createVerticalBaseLine("dirt", 7, 9, 16),

    // Einzelne zerbrochene Steinplatten.
    ...createBaseTiles("stoneFloor", [
      [10, 16],
      [12, 16],
      [14, 16],
      [11, 17],
      [13, 17],
    ]),
  ],

  objects: [
    // Außenmauer oben und unten
    ...createHorizontalLine("wall", 0, 0, 24),
    ...createHorizontalLine("wall", 24, 0, 24),

    // Außenmauer links und rechts
    ...createVerticalLine("wall", 0, 1, 23),
    ...createVerticalLine("wall", 24, 1, 23),

    // Kleine Lückenoptik an der Außenwand durch zusätzliche Felsen innen
    ...createObjects("rock", [
      [2, 1],
      [17, 1],
      [22, 1],
      [1, 6],
      [1, 18],
      [23, 7],
      [23, 17],
      [4, 23],
      [12, 23],
      [20, 23],
    ]),

    // Linke obere Ruine
    ...createHorizontalLine("wall", 4, 3, 8),
    ...createVerticalLine("wall", 3, 5, 9),
    ...createHorizontalLine("wall", 9, 3, 6),
    ...createObjects("wall", [
      [8, 5],
      [8, 6],
      [6, 7],
    ]),

    // Rechte obere Ruine
    ...createHorizontalLine("wall", 4, 16, 21),
    ...createVerticalLine("wall", 21, 5, 9),
    ...createHorizontalLine("wall", 9, 18, 21),
    ...createObjects("wall", [
      [16, 5],
      [16, 6],
      [18, 7],
    ]),

    // Zerfallene Steine in der rechten Ruine.
    ...createObjects("rock", [
      [19, 5],
      [17, 8],
    ]),

    // Zentrale Tempelstruktur
    ...createHorizontalLine("wall", 10, 9, 15),
    ...createHorizontalLine("wall", 15, 9, 15),
    ...createVerticalLine("wall", 15, 11, 14),

    // Offene Eingänge in der Tempelstruktur
    ...createObjects("rock", [
      [13, 12],
      [12, 14],
    ]),

    // Chest als zentrales Zielobjekt
    ...createObjects("chest", [[12, 12]]),

    // Kleiner Wasserlauf unten links
    ...createObjects("water", [
      [3, 19],
      [4, 20],
      [5, 20],
      [6, 19],
      [7, 19],
      [8, 20],
      [9, 20],
      [10, 21],
    ]),

    // Kleiner Wasserlauf unten rechts
    ...createObjects("water", [
      [17, 19],
      [18, 19],
      [19, 20],
      [20, 20],
      [21, 21],
      [21, 20],
    ]),

    // Waldcluster links unten
    ...createObjects("tree", [
      [3, 13],
      [4, 12],
      [5, 13],
      [4, 14],
      [6, 15],
      [3, 16],
      [5, 17],
    ]),

    // Waldcluster rechts oben
    ...createObjects("tree", [
      [20, 5],
      [19, 7],
      [20, 8],
      [22, 10],
    ]),

    // Waldcluster rechts unten
    ...createObjects("tree", [
      [18, 14],
      [19, 15],
      [21, 16],
      [19, 17],
    ]),

    // Büsche links oben
    ...createObjects("bush", [
      [8, 7],
      [6, 8],
    ]),

    // Büsche rechts oben.
    ...createObjects("bush", [
      [15, 6],

      [18, 8],
    ]),

    // Büsche unten links.
    ...createObjects("bush", [
      [6, 18],
      [7, 18],
      [8, 17],
      [9, 18],
    ]),

    // Büsche unten rechts.
    ...createObjects("bush", [
      [15, 17],
      [16, 18],
      [17, 18],
      [18, 17],
    ]),

    // Einzelne Felsen als Deckung und Wegbrecher
    ...createObjects("rock", [
      [11, 6],
      [12, 6],
      [13, 6],
      [6, 11],
      [18, 11],
      [7, 21],
      [12, 19],
      [16, 21],
    ]),

    // Kleine diagonale Deckung oben links zur Mitte
    ...createObjects("rock", [
      [8, 10],
      [10, 12],
    ]),

    // Kleine diagonale Deckung rechts zur Mitte.
    ...createObjects("rock", [
      [16, 12],
      [17, 11],
      [18, 10],
    ]),

    // Spawn-Punkte
    ...createObjects("spawn", [
      [2, 2],
      [22, 2],
      [2, 22],
      [22, 22],
    ]),
  ],
};
