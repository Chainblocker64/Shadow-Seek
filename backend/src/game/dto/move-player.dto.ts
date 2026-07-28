import { IsIn } from 'class-validator';
import { MOVEMENT_DIRECTIONS, type MovementDirection } from '../types';

export class MovePlayerDto {
  @IsIn(MOVEMENT_DIRECTIONS)
  direction!: MovementDirection;
}
