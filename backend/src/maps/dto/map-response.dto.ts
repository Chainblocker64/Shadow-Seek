import type {
  BaseTileOverride,
  BaseTileType,
  MapObject,
} from '../../game/types';

export class MapResponseDto {
  id!: number;
  name!: string;
  width!: number;
  height!: number;
  baseTile!: BaseTileType;
  baseOverrides!: BaseTileOverride[];
  objects!: MapObject[];
  creatorId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
