import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class BaseTileOverrideDto {
  @IsInt()
  @Min(0)
  x!: number;

  @IsInt()
  @Min(0)
  y!: number;

  @IsString()
  type!: string;
}

export class MapObjectDto extends BaseTileOverrideDto {}

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

  @IsString()
  baseTile!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BaseTileOverrideDto)
  baseOverrides!: BaseTileOverrideDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MapObjectDto)
  objects!: MapObjectDto[];
}
