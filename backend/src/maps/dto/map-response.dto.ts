export class MapResponseDto {
  id!: number;
  name!: string;
  width!: number;
  height!: number;
  tiles!: string[][];
  creatorId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
