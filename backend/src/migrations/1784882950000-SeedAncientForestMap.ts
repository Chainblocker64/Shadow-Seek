import { MigrationInterface, QueryRunner } from 'typeorm';

// Layout copied from frontend/features/game/data/exampleMap.ts (originally "Forgotten Forest Temple"), renamed to match the hardcoded default room map name.
const MAP_NAME = 'Ancient Forest';
const CREATOR = 'system';

type BaseTileOverride = { x: number; y: number; type: string };
type MapObject = { x: number; y: number; type: string };

function createObjects(
  type: string,
  coordinates: Array<[number, number]>,
): MapObject[] {
  return coordinates.map(([x, y]) => ({ x, y, type }));
}

function createHorizontalLine(
  type: string,
  y: number,
  startX: number,
  endX: number,
): MapObject[] {
  const objects: MapObject[] = [];
  for (let x = startX; x <= endX; x++) {
    objects.push({ x, y, type });
  }
  return objects;
}

function createVerticalLine(
  type: string,
  x: number,
  startY: number,
  endY: number,
): MapObject[] {
  const objects: MapObject[] = [];
  for (let y = startY; y <= endY; y++) {
    objects.push({ x, y, type });
  }
  return objects;
}

function createBaseTiles(
  type: string,
  coordinates: Array<[number, number]>,
): BaseTileOverride[] {
  return coordinates.map(([x, y]) => ({ x, y, type }));
}

function createHorizontalBaseLine(
  type: string,
  y: number,
  startX: number,
  endX: number,
): BaseTileOverride[] {
  const tiles: BaseTileOverride[] = [];
  for (let x = startX; x <= endX; x++) {
    tiles.push({ x, y, type });
  }
  return tiles;
}

function createVerticalBaseLine(
  type: string,
  x: number,
  startY: number,
  endY: number,
): BaseTileOverride[] {
  const tiles: BaseTileOverride[] = [];
  for (let y = startY; y <= endY; y++) {
    tiles.push({ x, y, type });
  }
  return tiles;
}

const BASE_OVERRIDES: BaseTileOverride[] = [
  ...createHorizontalBaseLine('stoneFloor', 5, 4, 7),
  ...createHorizontalBaseLine('stoneFloor', 6, 4, 7),
  ...createHorizontalBaseLine('stoneFloor', 7, 4, 7),
  ...createHorizontalBaseLine('stoneFloor', 8, 4, 7),

  ...createHorizontalBaseLine('stoneFloor', 5, 17, 20),
  ...createHorizontalBaseLine('stoneFloor', 6, 17, 20),
  ...createHorizontalBaseLine('stoneFloor', 7, 17, 20),
  ...createHorizontalBaseLine('stoneFloor', 8, 17, 20),

  ...createVerticalBaseLine('dirt', 2, 15, 20),
  ...createHorizontalBaseLine('dirt', 15, 2, 5),
  ...createHorizontalBaseLine('dirt', 4, 3, 8),
  ...createVerticalBaseLine('dirt', 5, 15, 16),
  ...createHorizontalBaseLine('dirt', 16, 5, 7),
  ...createVerticalBaseLine('dirt', 7, 9, 16),

  ...createBaseTiles('stoneFloor', [
    [10, 16],
    [12, 16],
    [14, 16],
    [11, 17],
    [13, 17],
  ]),
];

const OBJECTS: MapObject[] = [
  ...createHorizontalLine('wall', 0, 0, 24),
  ...createHorizontalLine('wall', 24, 0, 24),
  ...createVerticalLine('wall', 0, 1, 23),
  ...createVerticalLine('wall', 24, 1, 23),

  ...createObjects('rock', [
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

  ...createHorizontalLine('wall', 4, 3, 8),
  ...createVerticalLine('wall', 3, 5, 9),
  ...createHorizontalLine('wall', 9, 3, 6),
  ...createObjects('wall', [
    [8, 5],
    [8, 6],
    [6, 7],
  ]),

  ...createHorizontalLine('wall', 4, 16, 21),
  ...createVerticalLine('wall', 21, 5, 9),
  ...createHorizontalLine('wall', 9, 18, 21),
  ...createObjects('wall', [
    [16, 5],
    [16, 6],
    [18, 7],
  ]),

  ...createObjects('rock', [
    [19, 5],
    [17, 8],
  ]),

  ...createHorizontalLine('wall', 10, 9, 15),
  ...createHorizontalLine('wall', 15, 9, 15),
  ...createVerticalLine('wall', 15, 11, 14),

  ...createObjects('rock', [
    [13, 12],
    [12, 14],
  ]),

  ...createObjects('chest', [[12, 12]]),

  ...createObjects('water', [
    [3, 19],
    [4, 20],
    [5, 20],
    [6, 19],
    [7, 19],
    [8, 20],
    [9, 20],
    [10, 21],
  ]),

  ...createObjects('water', [
    [17, 19],
    [18, 19],
    [19, 20],
    [20, 20],
    [21, 21],
    [21, 20],
  ]),

  ...createObjects('tree', [
    [3, 13],
    [4, 12],
    [5, 13],
    [4, 14],
    [6, 15],
    [3, 16],
    [5, 17],
  ]),

  ...createObjects('tree', [
    [20, 5],
    [19, 7],
    [20, 8],
    [22, 10],
  ]),

  ...createObjects('tree', [
    [18, 14],
    [19, 15],
    [21, 16],
    [19, 17],
  ]),

  ...createObjects('bush', [
    [8, 7],
    [6, 8],
  ]),

  ...createObjects('bush', [
    [15, 6],
    [18, 8],
  ]),

  ...createObjects('bush', [
    [6, 18],
    [7, 18],
    [8, 17],
    [9, 18],
  ]),

  ...createObjects('bush', [
    [15, 17],
    [16, 18],
    [17, 18],
    [18, 17],
  ]),

  ...createObjects('rock', [
    [11, 6],
    [12, 6],
    [13, 6],
    [6, 11],
    [18, 11],
    [7, 21],
    [12, 19],
    [16, 21],
  ]),

  ...createObjects('rock', [
    [8, 10],
    [10, 12],
  ]),

  ...createObjects('rock', [
    [16, 12],
    [17, 11],
    [18, 10],
  ]),

  ...createObjects('spawn', [
    [2, 2],
    [22, 2],
    [2, 22],
    [22, 22],
  ]),
];

export class SeedAncientForestMap1784882950000 implements MigrationInterface {
  name = 'SeedAncientForestMap1784882950000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "maps" ("name", "width", "height", "baseTile", "baseOverrides", "objects", "creator")
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7)`,
      [
        MAP_NAME,
        25,
        25,
        'grass',
        JSON.stringify(BASE_OVERRIDES),
        JSON.stringify(OBJECTS),
        CREATOR,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "maps" WHERE "name" = $1`, [MAP_NAME]);
  }
}
