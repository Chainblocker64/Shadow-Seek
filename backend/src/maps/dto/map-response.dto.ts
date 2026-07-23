import { Expose } from 'class-transformer';
import type {
  BaseTileOverride,
  BaseTileType,
  MapObject,
} from '../../game/types';

export class MapResponseDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  width!: number;

  @Expose()
  height!: number;

  @Expose()
  baseTile!: BaseTileType;

  @Expose()
  baseOverrides!: BaseTileOverride[];

  @Expose()
  objects!: MapObject[];

  @Expose()
  creator!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
