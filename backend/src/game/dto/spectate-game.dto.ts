import { IsUUID } from 'class-validator';
import type { RoomId } from '../../shared/types';

export class SpectateGameDto {
  @IsUUID()
  roomId!: RoomId;
}
