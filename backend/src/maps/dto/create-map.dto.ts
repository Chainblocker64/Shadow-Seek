import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateMapDto {
  @IsNotEmpty({ message: 'Map name is required' })
  @IsString()
  name!: string;

  @Min(5)
  @IsInt({ message: 'Map width must be an integer greater than 0' })
  @IsPositive({ message: 'Map width must be greater than 0' })
  width!: number;

  @Min(5)
  @IsInt({ message: 'Map height must be an integer greater than 0' })
  @IsPositive({ message: 'Map height must be greater than 0' })
  height!: number;

  @IsArray({ message: 'Map tiles must be a 2D array' })
  @IsNotEmpty({ message: 'Map tiles are required' })
  tiles!: string[][];
}
