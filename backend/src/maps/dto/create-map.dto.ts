import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsIn,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  BASE_TILE_TYPES,
  OBJECT_TYPES,
  type BaseTileType,
  type ObjectType,
} from '../../game/types';

export class BaseTileOverrideDto {
  @IsInt()
  @Min(0)
  x!: number;

  @IsInt()
  @Min(0)
  y!: number;

  @IsIn(BASE_TILE_TYPES)
  type!: BaseTileType;
}

export class MapObjectDto {
  @IsInt()
  @Min(0)
  x!: number;

  @IsInt()
  @Min(0)
  y!: number;

  @IsIn(OBJECT_TYPES)
  type!: ObjectType;
}

export class CreateMapDto {
  @IsNotEmpty({ message: 'Map name is required' })
  @IsString()
  name!: string;

  @Min(5)
  @IsInt({ message: 'Map width must be an integer greater than 0' })
  width!: number;

  @Min(5)
  @IsInt({ message: 'Map height must be an integer greater than 0' })
  height!: number;

  @IsIn(BASE_TILE_TYPES)
  baseTile!: BaseTileType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BaseTileOverrideDto)
  baseOverrides!: BaseTileOverrideDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MapObjectDto)
  objects!: MapObjectDto[];
}
